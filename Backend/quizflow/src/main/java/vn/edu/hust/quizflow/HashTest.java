package vn.edu.hust.quizflow;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    public static void main(String[] args) {
        System.out.println("HASH_RESULT=" + new BCryptPasswordEncoder().encode("123123"));
    }
}
