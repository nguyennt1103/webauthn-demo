package com.example.webauthndemo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
                .formLogin(form -> form
                        .loginPage("/login").permitAll())
                .webAuthn(webAuthn -> webAuthn
                        .rpId("localhost")
                        .allowedOrigins("http://localhost:8080"))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/login/**", "/error").permitAll()
                        .requestMatchers("/webjars/**", "/js/**").permitAll()
                        .anyRequest().authenticated());

        return http.build();
    }
}
