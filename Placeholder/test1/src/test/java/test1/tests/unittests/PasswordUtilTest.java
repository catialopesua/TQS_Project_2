package test1.tests.unittests;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.util.PasswordUtil;

@ExtendWith(MockitoExtension.class)
class PasswordUtilTest {

    private PasswordUtil passwordUtil = new PasswordUtil();

    @Test
    void encode_producesHashedPassword() {
        String rawPassword = "mySecurePassword123";
        String encodedPassword = passwordUtil.encode(rawPassword);

        assertThat(encodedPassword).isNotNull();
        assertThat(encodedPassword).isNotEqualTo(rawPassword);
        assertThat(encodedPassword.length()).isGreaterThan(0);
    }

    @Test
    void encode_producesDifferentHashForSameInput() {
        String rawPassword = "password";
        String hash1 = passwordUtil.encode(rawPassword);
        String hash2 = passwordUtil.encode(rawPassword);

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void matches_withCorrectPassword_returnsTrue() {
        String rawPassword = "correctPassword";
        String encodedPassword = passwordUtil.encode(rawPassword);

        boolean result = passwordUtil.matches(rawPassword, encodedPassword);

        assertThat(result).isTrue();
    }

    @Test
    void matches_withIncorrectPassword_returnsFalse() {
        String rawPassword = "correctPassword";
        String wrongPassword = "wrongPassword";
        String encodedPassword = passwordUtil.encode(rawPassword);

        boolean result = passwordUtil.matches(wrongPassword, encodedPassword);

        assertThat(result).isFalse();
    }

    @Test
    void matches_withEmptyPassword_returnsFalse() {
        String rawPassword = "correctPassword";
        String encodedPassword = passwordUtil.encode(rawPassword);

        boolean result = passwordUtil.matches("", encodedPassword);

        assertThat(result).isFalse();
    }

    @Test
    void matches_withNullEncodedPassword_returnsFalse() {
        String rawPassword = "password";

        boolean result = passwordUtil.matches(rawPassword, null);

        assertThat(result).isFalse();
    }

    @Test
    void encode_withComplexCharacters() {
        String complexPassword = "P@ssw0rd!#$%&*()";
        String encodedPassword = passwordUtil.encode(complexPassword);

        assertThat(encodedPassword).isNotNull();
        assertThat(passwordUtil.matches(complexPassword, encodedPassword)).isTrue();
    }

    @Test
    void matches_isCaseSensitive() {
        String rawPassword = "Password123";
        String encodedPassword = passwordUtil.encode(rawPassword);

        boolean result = passwordUtil.matches("password123", encodedPassword);

        assertThat(result).isFalse();
    }
}
