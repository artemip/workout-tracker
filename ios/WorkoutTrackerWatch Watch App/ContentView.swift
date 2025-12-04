//
//  ContentView.swift
//  WorkoutTrackerWatch Watch App
//
//  Main workout UI with Digital Crown controls
//

import SwiftUI
import Combine
import WatchKit

struct ContentView: View {
    @StateObject private var phoneConnectivity = PhoneConnectivity.shared
    @StateObject private var workoutManager = WorkoutManager.shared
    
    var body: some View {
        Group {
            if let state = phoneConnectivity.workoutState {
                WorkoutView(state: state)
            } else {
                WaitingView(isPhoneReachable: phoneConnectivity.isPhoneReachable)
            }
        }
        .task {
            await workoutManager.requestAuthorization()
        }
    }
}

// MARK: - Waiting View

struct WaitingView: View {
    let isPhoneReachable: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "figure.strengthtraining.traditional")
                .font(.system(size: 40))
                .foregroundStyle(.blue)
            
            Text("Workout Tracker")
                .font(.headline)
            
            Text(isPhoneReachable ? "Start a workout on iPhone" : "iPhone not connected")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            
            if !isPhoneReachable {
                Image(systemName: "iphone.slash")
                    .foregroundStyle(.orange)
            }
        }
        .padding()
    }
}

// MARK: - Workout View

struct WorkoutView: View {
    let state: WorkoutState
    
    @StateObject private var workoutManager = WorkoutManager.shared
    @StateObject private var phoneConnectivity = PhoneConnectivity.shared
    
    // Use Double for Digital Crown compatibility
    @State private var adjustedWeight: Double = 0
    @State private var adjustedReps: Double = 0
    @State private var focusedField: FocusedField = .weight
    @State private var showingConfirmation = false
    
    @State private var remainingSeconds: Int = 0
    @State private var timerActive = false
    @State private var timerSkipped = false
    
    enum FocusedField {
        case weight, reps
    }
    
    var body: some View {
        Group {
            if timerActive && remainingSeconds > 0 && !timerSkipped {
                RestTimerView(
                    remainingSeconds: remainingSeconds,
                    totalSeconds: state.restTimeSeconds,
                    onSkip: { timerSkipped = true }
                )
            } else {
                exerciseView
            }
        }
        .onAppear {
            adjustedWeight = Double(state.weight)
            adjustedReps = Double(state.targetReps)
            timerSkipped = false
            updateTimer()
            // HealthKit workout is now started from PhoneConnectivity when receiving workoutStarted
        }
        .onChange(of: state) { _, newState in
            adjustedWeight = Double(newState.weight)
            adjustedReps = Double(newState.targetReps)
            timerSkipped = false
            updateTimer()
        }
        .onReceive(Timer.publish(every: 1, on: .main, in: .common).autoconnect()) { _ in
            let oldRemaining = remainingSeconds
            updateTimer()
            
            // Buzz when timer completes
            if oldRemaining > 0 && remainingSeconds == 0 && !timerSkipped {
                WKInterfaceDevice.current().play(.notification)
            }
        }
    }
    
    private var exerciseView: some View {
        ScrollView {
            VStack(spacing: 8) {
                // Exercise name
                Text(state.exerciseName)
                    .font(.headline)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                
                // Set indicator
                Text("Set \(state.currentSet) of \(state.totalSets)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                
                Divider()
                    .padding(.vertical, 4)
                
                // Weight and Reps pickers
                HStack(spacing: 16) {
                    ValuePicker(
                        label: "LBS",
                        value: Int(adjustedWeight),
                        isFocused: focusedField == .weight
                    )
                    .onTapGesture {
                        focusedField = .weight
                    }
                    
                    ValuePicker(
                        label: "REPS",
                        value: Int(adjustedReps),
                        isFocused: focusedField == .reps
                    )
                    .onTapGesture {
                        focusedField = .reps
                    }
                }
                .focusable()
                .digitalCrownRotation(
                    focusedField == .weight ? $adjustedWeight : $adjustedReps,
                    from: 0.0,
                    through: focusedField == .weight ? 500.0 : 50.0,
                    by: focusedField == .weight ? 5.0 : 1.0,
                    sensitivity: .medium,
                    isContinuous: false,
                    isHapticFeedbackEnabled: true
                )
                
                // Metrics row
                if workoutManager.isWorkoutActive {
                    HStack(spacing: 12) {
                        MetricBadge(
                            icon: "heart.fill",
                            value: "\(Int(workoutManager.heartRate))",
                            color: .red
                        )
                        MetricBadge(
                            icon: "flame.fill",
                            value: "\(Int(workoutManager.activeCalories))",
                            color: .orange
                        )
                    }
                    .padding(.top, 4)
                }
                
                Spacer(minLength: 8)
                
                // Complete button
                Button(action: completeSet) {
                    Text(state.currentSet >= state.totalSets ? "Complete Exercise" : "Complete Set")
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(state.currentSet >= state.totalSets ? .green : .blue)
            }
            .padding(.horizontal, 4)
        }
    }
    
    private func updateTimer() {
        if state.isRestTimerActive {
            remainingSeconds = state.remainingRestSeconds
            timerActive = remainingSeconds > 0
        } else {
            timerActive = false
            remainingSeconds = 0
        }
    }
    
    // HealthKit workout is started/ended via PhoneConnectivity when iPhone sends workoutStarted/workoutEnded
    
    private func completeSet() {
        phoneConnectivity.sendSetCompleted(
            weight: Int(adjustedWeight),
            repsCompleted: Int(adjustedReps)
        )
        
        // Haptic feedback
        WKInterfaceDevice.current().play(.success)
    }
}

// MARK: - Value Picker

struct ValuePicker: View {
    let label: String
    let value: Int
    let isFocused: Bool
    
    var body: some View {
        VStack(spacing: 2) {
            Text("\(value)")
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(isFocused ? .blue : .primary)
            
            Text(label)
                .font(.system(.caption2, design: .rounded))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isFocused ? Color.blue.opacity(0.15) : Color.clear)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isFocused ? Color.blue : Color.clear, lineWidth: 2)
        )
    }
}

// MARK: - Rest Timer View

struct RestTimerView: View {
    let remainingSeconds: Int
    let totalSeconds: Int
    let onSkip: () -> Void
    
    private var progress: Double {
        guard totalSeconds > 0 else { return 0 }
        return Double(totalSeconds - remainingSeconds) / Double(totalSeconds)
    }
    
    var body: some View {
        VStack(spacing: 12) {
            Text("REST")
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            
            Text(formatTime(remainingSeconds))
                .font(.system(size: 52, weight: .bold, design: .rounded))
                .foregroundStyle(remainingSeconds <= 10 ? .orange : .primary)
                .monospacedDigit()
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(remainingSeconds <= 10 ? Color.orange : Color.blue)
                        .frame(width: geometry.size.width * progress, height: 6)
                        .animation(.linear(duration: 1), value: progress)
                }
            }
            .frame(height: 6)
            .padding(.horizontal, 16)
            
            // Skip button
            Button(action: {
                WKInterfaceDevice.current().play(.click)
                onSkip()
            }) {
                Text("Skip")
                    .font(.system(.body, design: .rounded))
            }
            .buttonStyle(.bordered)
        }
    }
    
    private func formatTime(_ seconds: Int) -> String {
        let mins = seconds / 60
        let secs = seconds % 60
        return String(format: "%d:%02d", mins, secs)
    }
}

// MARK: - Metric Badge

struct MetricBadge: View {
    let icon: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(color)
            
            Text(value)
                .font(.caption)
                .fontWeight(.medium)
        }
    }
}

// MARK: - Preview

#Preview {
    ContentView()
}
