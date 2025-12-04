//
//  WorkoutTrackerWatchApp.swift
//  WorkoutTrackerWatch Watch App
//
//  Entry point for the watchOS companion app
//

import SwiftUI
import WatchKit

@main
struct WorkoutTrackerWatchApp: App {
    
    @StateObject private var phoneConnectivity = PhoneConnectivity.shared
    @StateObject private var workoutManager = WorkoutManager.shared
    
    @SceneBuilder var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(phoneConnectivity)
                .environmentObject(workoutManager)
                .onAppear {
                    // Initialize connectivity on app launch
                    _ = PhoneConnectivity.shared
                }
        }
        
        // Background workout session
        WKNotificationScene(controller: NotificationController.self, category: "workoutReminder")
    }
}

// MARK: - Notification Controller

class NotificationController: WKUserNotificationHostingController<NotificationView> {
    override var body: NotificationView {
        NotificationView()
    }
}

struct NotificationView: View {
    var body: some View {
        Text("Rest time is over!")
            .font(.headline)
    }
}
