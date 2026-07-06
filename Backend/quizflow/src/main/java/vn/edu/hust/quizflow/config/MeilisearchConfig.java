package vn.edu.hust.quizflow.config;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MeilisearchConfig {

    @Value("${meilisearch.host:http://localhost:7700}")
    private String host;

    @Value("${meilisearch.api-key:MASTER_KEY_VDT_2024}")
    private String apiKey;

    @Bean
    public Client meilisearchClient() {
        return new Client(new Config(host, apiKey));
    }
}
