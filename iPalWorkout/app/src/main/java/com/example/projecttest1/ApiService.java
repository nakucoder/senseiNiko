package com.example.projecttest1;

import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;


public interface ApiService {
    @GET("exercises")
    Call<List<Exercises>> getExercises();
}

