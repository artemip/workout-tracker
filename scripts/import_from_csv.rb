# typed: ignore
require 'csv'
require "net/http"
require 'json'
require 'dotenv'
Dotenv.load

raise ".csv missing for arg[0]" if ARGV[0].nil?

HOST = ENV["SUPABASE_PROJECT_HOST"]
API_KEY = ENV["SUPABASE_API_KEY"]

def send_post(model, data)
  url = URI::HTTPS.build(
    {
      host: HOST,
      path: "/rest/v1/#{model}",
    }
  )

  https = Net::HTTP.new(url.host, url.port)
  https.use_ssl = true

  request = Net::HTTP::Post.new(url)
  request["Authorization"] = "Bearer #{API_KEY}"
  request["apikey"] = API_KEY
  request["Content-Type"] = "application/json"
  request["Prefer"] = "return=headers-only"
  request.body = data.to_json

  response = https.request(request)

  if response.code != "201"
    puts "Error: #{response.code} #{response.body}"
  end

  created_id = response["Location"].match(/id=eq\.(\d+)/)[1].to_i
end

def create_workout(name, meso_cycle, order) 
  # Call supabase API to create workout
  puts "Creating workout #{name} for meso cycle #{meso_cycle} with order #{order}"
  data = {
    name: name,
    meso_cycle: meso_cycle,
    order: order,
  }

  send_post("workouts", data)
end

def create_exercise(name)
  type = if name.include?("DB")
    "Dumbbell"
  elsif name.include?("BB")
    "Barbell"
  elsif name.include?("KB")
    "Kettlebell"
  elsif name.include?("BW")
    "Bodyweight"
  elsif name.include?("EZ")
    "EZ Bar"
  elsif name.include?("NG") || name.include?("Cable")
    "Cable"
  end

  # Call supabase API to create exercise
  puts "Creating exercise #{name}"
  data = {
    name: name,
    type: type,
  }

  send_post("exercises", data)
end

def create_workout_exercise(
  workout_id, 
  exercise_id, 
  order, 
  num_sets, 
  num_reps_per_set, 
  weight, 
  rest_time_seconds, 
  end_with_drop_set)
  # Call supabase API to create workout_exercise
  puts "Creating workout_exercise for workout #{workout_id} and exercise #{exercise_id} with order #{order}"
  data = {
    workout_id: workout_id,
    exercise_id: exercise_id,
    order: order,
    num_sets: num_sets,
    num_reps_per_set: num_reps_per_set,
    weight: weight,
    rest_time_seconds: rest_time_seconds,
    end_with_drop_set: end_with_drop_set,
  }

  send_post("workout_exercises", data)
end

meso_cycle_num = -1
exercises = {}
last_created_workout_id = -1
exercise_order = 0

CSV.foreach(ARGV[0], headers: false) do |row|
  next if row[0].nil? || row[0].empty?

  if row[0].include?("Meso Cycle")
    meso_cycle_num = row[0].split(" ")[2].to_i
  elsif row[0].include?("Day")
    day_num = row[0].split(" ")[1].to_i
    workout_name = row[0].split(" ")[2..-1].join(" ").gsub(/\(.*\)/, "").strip
    last_created_workout_id = create_workout(workout_name, meso_cycle_num, day_num)
    exercise_order = 0
  else
    exercise_order += 1
    exercise_name = row[1].strip

    if !exercises[exercise_name]
      data = {
        name: exercise_name,
      }

      created_id = create_exercise(exercise_name)
      exercises[exercise_name] = created_id
    end

    exercise_id = exercises[exercise_name]

    weight = if row[2]&.include?("45's/side")
      num_plates = row[2].split("-45's/side")[0].to_i
      num_plates * 45
    elsif row[2]&.include?("/side")
      row[2].split("/side")[0].to_i * 2
    else
      row[2]&.to_i || 0
    end

    sets = row[3..7].reject(&:nil?).reject(&:empty?).reject {|r| r == "Drop Set"}
    num_sets = sets.length
    num_reps_per_set = sets[0].to_i
    end_with_drop_set = row.select { |r| r == "Drop Set" }.length > 0
    rest_time = row.reject(&:nil?).reject(&:empty?).last.match(/(\d+)(s|min)/)
    rest_time_seconds = rest_time.nil? ? 0 : rest_time[0].include?("s") ? rest_time[1].to_i : rest_time[1].to_i * 60

    create_workout_exercise(
      last_created_workout_id,
      exercise_id,
      exercise_order,
      num_sets,
      num_reps_per_set,
      weight,
      rest_time_seconds,
      end_with_drop_set
    )
  end
end