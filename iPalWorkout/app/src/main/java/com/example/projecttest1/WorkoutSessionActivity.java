package com.example.projecttest1;

import android.app.Activity;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.bumptech.glide.Glide;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.List;

public class WorkoutSessionActivity extends Activity {
    private TextView workoutTypeView, currentExerciseView, timerView, repsView, poseStatusView;
    private ImageView exerciseAnimation;
    private Button backButton, pauseButton, skipButton;
    private CountDownTimer timer;
    private boolean isPaused = false;
    private int exerciseIndex = 0;

    private List<Exercises> allExercises;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_workout_session);

        workoutTypeView = (TextView) findViewById(R.id.workout_type_view);
        currentExerciseView = (TextView) findViewById(R.id.current_exercise);
        timerView = (TextView) findViewById(R.id.timer_view);
        repsView = (TextView) findViewById(R.id.reps_view);
        poseStatusView = (TextView) findViewById(R.id.pose_status);
        exerciseAnimation = (ImageView) findViewById(R.id.exercise_image);
        backButton = (Button) findViewById(R.id.btn_back);
        pauseButton = (Button) findViewById(R.id.pause_button);
        skipButton = (Button) findViewById(R.id.skip_button);

        String workoutsJson = getIntent().getStringExtra("workouts");

        if (workoutsJson != null) {
            Gson gson = new Gson();
            Type type = new TypeToken<List<Exercises>>() {}.getType();
            allExercises = gson.fromJson(workoutsJson, type);
        }

        if (allExercises == null || allExercises.isEmpty()) {
            Toast.makeText(this, "No exercises found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        workoutTypeView.setText("Workout Type: " + allExercises.get(0).getCategory());

        startExercise();

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (timer != null) timer.cancel();
                finish();
            }
        });

        pauseButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isPaused) {
                    isPaused = false;
                    startExercise();
                    pauseButton.setText("Pause");
                } else {
                    isPaused = true;
                    if (timer != null) timer.cancel();
                    pauseButton.setText("Resume");
                    poseStatusView.setText("Paused");
                }
            }
        });

        skipButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (timer != null) timer.cancel();
                nextExercise();
            }
        });
    }

    private void startExercise() {
        if (exerciseIndex >= allExercises.size()) {
            currentExerciseView.setText("Workout Complete!");
            timerView.setText("");
            repsView.setText("");
            poseStatusView.setText("Well done!");
            return;
        }

        final Exercises exercise = allExercises.get(exerciseIndex);
        currentExerciseView.setText(exercise.getExercise());
        poseStatusView.setText("Doing " + exercise.getExercise());

        Glide.with(this).load(exercise.getAnimation_url()).into(exerciseAnimation);

        if (exercise.getMetric_type().equalsIgnoreCase("Timer")) {
            int durationSeconds = 30;
            try {
                durationSeconds = Integer.parseInt(exercise.getTracking());
            } catch (Exception ignored) {}

            repsView.setText("");
            timer = new CountDownTimer(durationSeconds * 1000, 1000) {
                public void onTick(long millisUntilFinished) {
                    timerView.setText("Time left: " + millisUntilFinished / 1000 + "s");
                }

                public void onFinish() {
                    timerView.setText("Done!");
                    nextExercise();
                }
            }.start();
        } else {
            timerView.setText("Reps-based");
            repsView.setText("Reps: " + exercise.getTracking());
        }
    }

    private void nextExercise() {
        exerciseIndex++;
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                startExercise();
            }
        }, 1000);
    }
}
