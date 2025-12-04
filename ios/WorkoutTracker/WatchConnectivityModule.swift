//
//  WatchConnectivityModule.swift
//  WorkoutTracker
//
//  Native module to bridge React Native with Apple Watch via WatchConnectivity
//

import Foundation
import WatchConnectivity
import React

@objc(WatchConnectivityModule)
class WatchConnectivityModule: RCTEventEmitter, WCSessionDelegate {
    
    private var session: WCSession?
    private var hasListeners = false
    
    override init() {
        super.init()
        setupSession()
    }
    
    private func setupSession() {
        print("[WatchConnectivity] Setting up session, isSupported: \(WCSession.isSupported())")
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
            print("[WatchConnectivity] Session activated, isPaired: \(session?.isPaired ?? false), isReachable: \(session?.isReachable ?? false)")
        }
    }
    
    // MARK: - React Native Bridge
    
    override static func moduleName() -> String! {
        return "WatchConnectivityModule"
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return [
            "onWatchReachabilityChanged",
            "onSetCompleted",
            "onWatchMessage"
        ]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    // MARK: - Exported Methods
    
    @objc
    func isWatchPaired(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let session = session else {
            resolve(false)
            return
        }
        resolve(session.isPaired)
    }
    
    @objc
    func isWatchReachable(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let session = session else {
            resolve(false)
            return
        }
        resolve(session.isReachable)
    }
    
    @objc
    func sendWorkoutState(_ state: NSDictionary) {
        print("[WatchConnectivity] sendWorkoutState called")
        print("[WatchConnectivity] Session exists: \(session != nil)")
        print("[WatchConnectivity] isPaired: \(session?.isPaired ?? false)")
        print("[WatchConnectivity] isReachable: \(session?.isReachable ?? false)")
        print("[WatchConnectivity] State: \(state)")
        
        guard let session = session else {
            print("[WatchConnectivity] No session available")
            return
        }
        
        // Always update application context (persists even when Watch isn't reachable)
        updateApplicationContext(state)
        
        if session.isReachable {
            let message = state as? [String: Any] ?? [:]
            print("[WatchConnectivity] Sending message to Watch...")
            session.sendMessage(message, replyHandler: { response in
                print("[WatchConnectivity] Message sent successfully, response: \(response)")
            }) { error in
                print("[WatchConnectivity] Error sending message: \(error.localizedDescription)")
            }
        } else {
            print("[WatchConnectivity] Watch not reachable, only using application context")
        }
    }
    
    @objc
    func sendWorkoutStarted(_ workoutData: NSDictionary) {
        var data = workoutData as? [String: Any] ?? [:]
        data["type"] = "workoutStarted"
        
        guard let session = session else { return }
        
        if session.isReachable {
            session.sendMessage(data, replyHandler: nil) { error in
                print("[WatchConnectivity] Error sending workout started: \(error.localizedDescription)")
            }
        }
        updateApplicationContext(workoutData)
    }
    
    @objc
    func sendWorkoutEnded() {
        let data: [String: Any] = ["type": "workoutEnded"]
        
        guard let session = session else { return }
        
        if session.isReachable {
            session.sendMessage(data, replyHandler: nil) { error in
                print("[WatchConnectivity] Error sending workout ended: \(error.localizedDescription)")
            }
        }
        
        do {
            try session.updateApplicationContext(["workoutActive": false])
        } catch {
            print("[WatchConnectivity] Error updating context: \(error.localizedDescription)")
        }
    }
    
    private func updateApplicationContext(_ state: NSDictionary) {
        guard let session = session else {
            print("[WatchConnectivity] Cannot update context - no session")
            return
        }
        
        var context = state as? [String: Any] ?? [:]
        context["workoutActive"] = true
        context["timestamp"] = Date().timeIntervalSince1970
        
        print("[WatchConnectivity] Updating application context: \(context)")
        
        do {
            try session.updateApplicationContext(context)
            print("[WatchConnectivity] Application context updated successfully")
        } catch {
            print("[WatchConnectivity] Error updating context: \(error.localizedDescription)")
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("[WatchConnectivity] Activation failed: \(error.localizedDescription)")
        } else {
            print("[WatchConnectivity] Session activated with state: \(activationState.rawValue)")
        }
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        print("[WatchConnectivity] Session became inactive")
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        print("[WatchConnectivity] Session deactivated")
        // Reactivate for switching watches
        session.activate()
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        if hasListeners {
            sendEvent(withName: "onWatchReachabilityChanged", body: ["isReachable": session.isReachable])
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        handleWatchMessage(message)
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        handleWatchMessage(message)
        replyHandler(["received": true])
    }
    
    private func handleWatchMessage(_ message: [String: Any]) {
        guard hasListeners else { return }
        
        let messageType = message["type"] as? String ?? "unknown"
        
        switch messageType {
        case "setCompleted":
            sendEvent(withName: "onSetCompleted", body: message)
        default:
            sendEvent(withName: "onWatchMessage", body: message)
        }
    }
}

