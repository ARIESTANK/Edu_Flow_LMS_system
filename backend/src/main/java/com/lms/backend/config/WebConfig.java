package com.lms.backend.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;


@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry corsRegistry){
        corsRegistry.addMapping("/**")
        .allowedOrigins("http://localhost:4200")
        .allowedMethods("*")
        .allowedHeaders("*")
        .allowCredentials(true);
    }
}
