package com.cms.cms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "gemini.api.key=dummy-key",
    "gemini.api.url=http://dummy-url",
    "app.verification.base-url=http://dummy-url",
    "spring.mail.host=localhost"
})
class CmsApplicationTests {

	@Test
	void contextLoads() {
	}

}
