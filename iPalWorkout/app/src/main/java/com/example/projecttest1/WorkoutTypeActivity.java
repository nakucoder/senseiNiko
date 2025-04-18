
package com.example.projecttest1;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class WorkoutTypeActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_workout_type);

        Button yoga = (Button) findViewById(R.id.yoga_button);
        Button calisthenics = (Button) findViewById(R.id.cali_button);
        Button cardio = (Button) findViewById(R.id.cardio_button);
        Button zumba = (Button) findViewById(R.id.zumba_button);
        Button backButton = (Button) findViewById(R.id.btn_back);


        View.OnClickListener listener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String type = "";
                switch (v.getId()) {
                    case R.id.yoga_button:
                        type = "Yoga";
                        break;
                    case R.id.cali_button:
                        type = "Calisthenics";
                        break;
                    case R.id.cardio_button:
                        type = "Cardio";
                        break;
                    case R.id.zumba_button:
                        type = "Zumba";
                        break;
                }

                showWarmupDialog(type);
            }
        };

        yoga.setOnClickListener(listener);
        calisthenics.setOnClickListener(listener);
        cardio.setOnClickListener(listener);
        zumba.setOnClickListener(listener);
        backButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                finish();
            }
        });
    }

    private void showWarmupDialog(final String workoutType) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Warm-Up");
        builder.setMessage("Would you like to warm up first?");
        builder.setCancelable(true);

        builder.setPositiveButton("Yes, warm up", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                Intent intent = new Intent(WorkoutTypeActivity.this, WarmUpActivity.class);
                intent.putExtra("workoutType", workoutType);
                startActivity(intent);
            }
        });

        builder.setNegativeButton("Skip warm-up", new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // TODO: Replace with real workout activity if available
                Intent intent = new Intent(WorkoutTypeActivity.this, WarmUpActivity.class);
                intent.putExtra("workoutType", workoutType);
                intent.putExtra("skipWarmup", true);
                startActivity(intent);
            }
        });

        AlertDialog alert = builder.create();
        alert.show();
    }
}
