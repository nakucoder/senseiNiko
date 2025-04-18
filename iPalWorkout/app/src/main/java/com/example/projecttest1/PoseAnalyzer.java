
package com.example.projecttest1;

import java.util.HashMap;
import java.util.Map;

public class PoseAnalyzer {

    public static class PoseResult {
        public String feedback;
        public boolean isGoodPosture;
        public float confidence;

        public PoseResult(String feedback, boolean isGoodPosture, float confidence) {
            this.feedback = feedback;
            this.isGoodPosture = isGoodPosture;
            this.confidence = confidence;
        }
    }

    // Keypoints format: Map<String, float[]> -> "left_knee": [x, y, score]
    public PoseResult analyze(String exercise, Map<String, float[]> keypoints) {
        if (exercise.equalsIgnoreCase("tree_pose")) {
            return analyzeTreePose(keypoints);
        } else if (exercise.equalsIgnoreCase("squats")) {
            return analyzeSquats(keypoints);
        } else if (exercise.equalsIgnoreCase("high_knees")) {
            return timeBasedFeedback("high_knees");
        } else if (exercise.equalsIgnoreCase("arm_swings")) {
            return timeBasedFeedback("arm_swings");
        }
        return new PoseResult("Unknown exercise", false, 0f);
    }

    private PoseResult analyzeTreePose(Map<String, float[]> keypoints) {
        // This is a placeholder — assume correct posture
        return new PoseResult("Hold the pose steady...", true, 0.95f);
    }

    private PoseResult analyzeSquats(Map<String, float[]> keypoints) {
        // Placeholder: simulate squat detection every few frames
        return new PoseResult("Squat depth looks good!", true, 0.92f);
    }

    private PoseResult timeBasedFeedback(String type) {
        String feedback = "Keep going...";
        if (type.equals("high_knees")) {
            feedback = "Pump those knees!";
        } else if (type.equals("arm_swings")) {
            feedback = "Swing your arms forward and back";
        }
        return new PoseResult(feedback, true, 1.0f);
    }
}
