
package com.example.projecttest1;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.TextView;
import android.view.View;
import android.widget.Button;
import android.content.Intent;

import android.robot.hw.RobotSystem;
import android.robot.motion.RobotMotion;
import android.robot.speech.SpeechManager;
import android.robot.speech.SpeechService;
import android.robot.speech.SpeechManager.OnConnectListener;

public class WarmUpActivity extends Activity {
    private static final String TAG = "WarmUpActivity";

    private RobotSystem mRobotSystem;
    private RobotMotion mRobotMotion;
    private SpeechManager mSpeechManager;
    private int mSessionId = 0;
    private String userName = "friend";

    private TextView workoutTypeText;
    private TextView statusText;

    private Handler handler = new Handler();
    private String workoutType = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_warmup);

        Button backButton = (Button) findViewById(R.id.btn_back);
        workoutTypeText = (TextView) findViewById(R.id.workout_type);
        statusText = (TextView) findViewById(R.id.status_text);

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        mRobotSystem = new RobotSystem();
        mRobotMotion = new RobotMotion();

        mSpeechManager = (SpeechManager) getSystemService(SpeechService.SERVICE_NAME);
        if (mSpeechManager == null) {
            mSpeechManager = new SpeechManager(this, new OnConnectListener() {
                @Override
                public void onConnect(boolean status) {
                    if (status) {
                        Log.d(TAG, "SpeechManager connected.");
                        mSpeechManager.setTtsEnable(true);
                    }
                }
            }, "com.avatar.dialog");
        } else {
            mSpeechManager.setTtsEnable(true);
        }

        workoutType = getIntent().getStringExtra("workoutType");
        if (workoutType != null) {
            workoutTypeText.setText("Workout Type: " + workoutType);
        }

        if (getIntent().getStringExtra("username") != null) {
            userName = getIntent().getStringExtra("username");
        }

        boolean skipWarmup = getIntent().getBooleanExtra("skipWarmup", false);

        if (skipWarmup) {
            statusText.setText("Skipping warm-up...");
            mSpeechManager.startSpeaking("Skipping warm-up. Let's start your " + workoutType + " session!", true, false);
            launchWorkoutSession();
        } else {
            statusText.setText("Starting warm-up...");
            startWarmupSequence();
        }
    }

    private void startWarmupSequence() {
        mSpeechManager.startSpeaking("Let's warm up!", true, false);

        handler.postDelayed(new Runnable() {
            public void run() {
                mRobotMotion.emoji(RobotMotion.Emoji.SMILE);
                mRobotMotion.doAction(RobotMotion.Action.CHEER);

                handler.postDelayed(new Runnable() {
                    public void run() {
                        mRobotMotion.startWalk(1000, 1, 0x00);

                        handler.postDelayed(new Runnable() {
                            public void run() {
                                mSpeechManager.startSpeaking("Great job " + userName + "!", true, false);
                                mRobotMotion.doAction(RobotMotion.Action.HIGHFIVE);
                                mRobotMotion.doAction(RobotMotion.Action.WIPE_PERSPIRATION);
                                statusText.setText("Warm-up completed!");

                                mSpeechManager.startSpeaking("Now let's begin your actual workout!", true, false);

                                handler.postDelayed(new Runnable() {
                                    public void run() {
                                        launchWorkoutSession();
                                    }
                                }, 4000); // delay to let speech finish
                            }
                        }, 4000); // after walk
                    }
                }, 2000); // after cheer
            }
        }, 2000); // after speaking
    }

    private void launchWorkoutSession() {
        Intent intent = new Intent(WarmUpActivity.this, WorkoutSessionActivity.class);
        intent.putExtra("workoutType", workoutType);
        startActivity(intent);
        finish();
    }
}
