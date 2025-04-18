package com.example.projecttest1;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.google.gson.Gson;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MenuActivity extends Activity {
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        Button startWorkoutButton = (Button) findViewById(R.id.start_workout);
        Button settingsButton = (Button) findViewById(R.id.settings);
        Button backButton = (Button) findViewById(R.id.btn_back);

        startWorkoutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Make API call to fetch workouts
                apiService = ApiClient.getClient().create(ApiService.class);
                Call<List<Exercises>> call = apiService.getExercises();

                call.enqueue(new Callback<List<Exercises>>() {
                    @Override
                    public void onResponse(Call<List<Exercises>> call, Response<List<Exercises>> response) {
                        if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                            List<Exercises> exercises = response.body();

                            Gson gson = new Gson();
                            String workoutsJson = gson.toJson(exercises);

                            Intent intent = new Intent(MenuActivity.this, WorkoutSessionActivity.class);
                            intent.putExtra("workouts", workoutsJson);
                            intent.putExtra("workoutType", "Full Body");
                            startActivity(intent);
                        } else {
                            Toast.makeText(MenuActivity.this, "No workouts received from server", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Exercises>> call, Throwable t) {
                        Toast.makeText(MenuActivity.this, "Failed to load workouts", Toast.LENGTH_LONG).show();
                        Log.e("API", "Error", t);
                    }
                });
            }
        });

        settingsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MenuActivity.this, SettingsActivity.class);
                startActivity(intent);
            }
        });

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
    }
}
