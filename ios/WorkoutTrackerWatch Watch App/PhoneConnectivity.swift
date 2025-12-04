//
//  PhoneConnectivity.swift
//  WorkoutTrackerWatch Watch App
//
//  Handles WatchConnectivity communication with iPhone
//

import Foundation
import Combine
import WatchConnectivity

class PhoneConnectivity: NSObject, ObservableObject, WCSessionDelegate {
    
    static let shared = PhoneConnectivity()
    
    @Published var isPhoneReachable = false
    @Published var workoutState: WorkoutState?
    
    private var session: WCSession?
    
    override init() {
        super.init()
        setupSession()
    }
    
    private func setupSession() {
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }
    
    // MARK: - Send Messages to iPhone
    
    func sendSetCompleted(weight: Int, repsCompleted: Int) {
        let message: [String: Any] = [
            "type": "setCompleted",
            "weight": weight,
            "repsCompleted": repsCompleted,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        guard let session = session, session.isReachable else {
            print("[PhoneConnectivity] Phone not reachable")
            return
        }
        
        session.sendMessage(message, replyHandler: { response in
            print("[PhoneConnectivity] Set completed acknowledged")
        }) { error in
            print("[PhoneConnectivity] Error sending set completed: \(error.localizedDescription)")
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable
        }
        
        if let error = error {
            print("[PhoneConnectivity] Activation failed: \(error.localizedDescription)")
        } else {
            print("[PhoneConnectivity] Session activated")
            // Check for any existing application context
            if !session.receivedApplicationContext.isEmpty {
                handleApplicationContext(session.receivedApplicationContext)
            }
        }
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isPhoneReachable = session.isReachable
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        handleMessage(message)
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        handleMessage(message)
        replyHandler(["received": true])
    }
    
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        handleApplicationContext(applicationContext)
    }
    
    private func handleMessage(_ message: [String: Any]) {
        let messageType = message["type"] as? String ?? ""
        
        switch messageType {
        case "workoutStarted":
            parseWorkoutState(from: message)
            // Start HealthKit workout session
            Task {
                await WorkoutManager.shared.startWorkout()
            }
        case "workoutEnded":
            DispatchQueue.main.async {
                self.workoutState = nil
            }
            // End HealthKit workout session
            Task {
                await WorkoutManager.shared.endWorkout()
            }
        default:
            // Treat as workout state update
            parseWorkoutState(from: message)
        }
    }
    
    private func handleApplicationContext(_ context: [String: Any]) {
        let workoutActive = context["workoutActive"] as? Bool ?? false
        
        if workoutActive {
            parseWorkoutState(from: context)
        } else {
            DispatchQueue.main.async {
                self.workoutState = nil
            }
        }
    }
    
    private func parseWorkoutState(from data: [String: Any]) {
        guard let exerciseData = data["exercise"] as? [String: Any],
              let exerciseName = exerciseData["name"] as? String else {
            // Try flat structure
            if let exerciseName = data["exerciseName"] as? String {
                let state = WorkoutState(
                    exerciseName: exerciseName,
                    exerciseType: data["exerciseType"] as? String,
                    currentSet: data["currentSet"] as? Int ?? 1,
                    totalSets: data["totalSets"] as? Int ?? 1,
                    weight: data["weight"] as? Int ?? 0,
                    targetReps: data["targetReps"] as? Int ?? 0,
                    restTimeSeconds: data["restTimeSeconds"] as? Int ?? 0,
                    timerStartedAt: data["timerStartedAt"] as? Double
                )
                DispatchQueue.main.async {
                    self.workoutState = state
                }
            }
            return
        }
        
        let state = WorkoutState(
            exerciseName: exerciseName,
            exerciseType: exerciseData["type"] as? String,
            currentSet: data["currentSet"] as? Int ?? 1,
            totalSets: data["totalSets"] as? Int ?? 1,
            weight: data["weight"] as? Int ?? 0,
            targetReps: data["targetReps"] as? Int ?? 0,
            restTimeSeconds: data["restTimeSeconds"] as? Int ?? 0,
            timerStartedAt: data["timerStartedAt"] as? Double
        )
        
        DispatchQueue.main.async {
            self.workoutState = state
        }
    }
}

// MARK: - Workout State Model

struct WorkoutState: Equatable {
    let exerciseName: String
    let exerciseType: String?
    let currentSet: Int
    let totalSets: Int
    let weight: Int
    let targetReps: Int
    let restTimeSeconds: Int
    let timerStartedAt: Double? // JavaScript timestamp in MILLISECONDS
    
    var isRestTimerActive: Bool {
        guard let startedAtMs = timerStartedAt else { return false }
        // Convert JS milliseconds to seconds
        let startedAtSec = startedAtMs / 1000.0
        let elapsed = Date().timeIntervalSince1970 - startedAtSec
        return elapsed >= 0 && elapsed < Double(restTimeSeconds)
    }
    
    var remainingRestSeconds: Int {
        guard let startedAtMs = timerStartedAt else { return 0 }
        // Convert JS milliseconds to seconds
        let startedAtSec = startedAtMs / 1000.0
        let elapsed = Date().timeIntervalSince1970 - startedAtSec
        let remaining = Double(restTimeSeconds) - elapsed
        return max(0, Int(remaining))
    }
}

