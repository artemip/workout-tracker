//
//  WorkoutManager.swift
//  WorkoutTrackerWatch Watch App
//
//  Manages HealthKit workout sessions and tracks workout metrics
//

import Foundation
import Combine
import HealthKit

class WorkoutManager: NSObject, ObservableObject {
    
    static let shared = WorkoutManager()
    
    private let healthStore = HKHealthStore()
    private var workoutSession: HKWorkoutSession?
    private var workoutBuilder: HKLiveWorkoutBuilder?
    
    @Published var isWorkoutActive = false
    @Published var heartRate: Double = 0
    @Published var activeCalories: Double = 0
    @Published var workoutDuration: TimeInterval = 0
    
    private var workoutStartDate: Date?
    
    override init() {
        super.init()
    }
    
    // MARK: - Authorization
    
    func requestAuthorization() async -> Bool {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("[WorkoutManager] HealthKit not available")
            return false
        }
        
        let typesToShare: Set<HKSampleType> = [
            HKObjectType.workoutType()
        ]
        
        let typesToRead: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.workoutType()
        ]
        
        do {
            try await healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead)
            print("[WorkoutManager] Authorization granted")
            return true
        } catch {
            print("[WorkoutManager] Authorization failed: \(error.localizedDescription)")
            return false
        }
    }
    
    // MARK: - Workout Session
    
    func startWorkout() async {
        guard !isWorkoutActive else {
            print("[WorkoutManager] Workout already active")
            return
        }
        
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .traditionalStrengthTraining
        configuration.locationType = .indoor
        
        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
            workoutBuilder = workoutSession?.associatedWorkoutBuilder()
            
            workoutSession?.delegate = self
            workoutBuilder?.delegate = self
            
            workoutBuilder?.dataSource = HKLiveWorkoutDataSource(
                healthStore: healthStore,
                workoutConfiguration: configuration
            )
            
            workoutStartDate = Date()
            
            let startDate = Date()
            workoutSession?.startActivity(with: startDate)
            try await workoutBuilder?.beginCollection(at: startDate)
            
            DispatchQueue.main.async {
                self.isWorkoutActive = true
            }
            
            print("[WorkoutManager] Workout started")
        } catch {
            print("[WorkoutManager] Failed to start workout: \(error.localizedDescription)")
        }
    }
    
    func endWorkout() async {
        guard isWorkoutActive, let session = workoutSession, let builder = workoutBuilder else {
            print("[WorkoutManager] No active workout to end")
            return
        }
        
        session.end()
        
        do {
            try await builder.endCollection(at: Date())
            try await builder.finishWorkout()
            
            DispatchQueue.main.async {
                self.isWorkoutActive = false
                self.resetMetrics()
            }
            
            print("[WorkoutManager] Workout ended and saved")
        } catch {
            print("[WorkoutManager] Failed to end workout: \(error.localizedDescription)")
        }
        
        workoutSession = nil
        workoutBuilder = nil
    }
    
    func pauseWorkout() {
        workoutSession?.pause()
    }
    
    func resumeWorkout() {
        workoutSession?.resume()
    }
    
    private func resetMetrics() {
        heartRate = 0
        activeCalories = 0
        workoutDuration = 0
        workoutStartDate = nil
    }
    
    private func updateMetrics(from statistics: HKStatistics) {
        DispatchQueue.main.async {
            switch statistics.quantityType {
            case HKQuantityType.quantityType(forIdentifier: .heartRate):
                let heartRateUnit = HKUnit.count().unitDivided(by: .minute())
                self.heartRate = statistics.mostRecentQuantity()?.doubleValue(for: heartRateUnit) ?? 0
                
            case HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned):
                let calorieUnit = HKUnit.kilocalorie()
                self.activeCalories = statistics.sumQuantity()?.doubleValue(for: calorieUnit) ?? 0
                
            default:
                break
            }
        }
    }
}

// MARK: - HKWorkoutSessionDelegate

extension WorkoutManager: HKWorkoutSessionDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        print("[WorkoutManager] Session state changed: \(fromState.rawValue) -> \(toState.rawValue)")
        
        DispatchQueue.main.async {
            self.isWorkoutActive = (toState == .running)
        }
    }
    
    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("[WorkoutManager] Session failed: \(error.localizedDescription)")
    }
}

// MARK: - HKLiveWorkoutBuilderDelegate

extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        for type in collectedTypes {
            guard let quantityType = type as? HKQuantityType else { continue }
            
            if let statistics = workoutBuilder.statistics(for: quantityType) {
                updateMetrics(from: statistics)
            }
        }
    }
    
    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
        // Handle workout events if needed
    }
}

