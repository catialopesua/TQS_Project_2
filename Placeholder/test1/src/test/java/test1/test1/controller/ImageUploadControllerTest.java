package test1.test1.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;

import org.hibernate.mapping.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import aj.org.objectweb.asm.commons.Method;

@ExtendWith(MockitoExtension.class)
public class ImageUploadControllerTest {
    

    @Test
    void testIsValidImageType() throws Exception {
        String content1 = null;
        String content2 = "image/acoolgame.png";

        ImageUploadController controller = new ImageUploadController();

        java.lang.reflect.Method method = ImageUploadController.class.getDeclaredMethod(
            "isValidImageType",
            String.class
        );
        method.setAccessible(true);

        Boolean result1 = (Boolean) method.invoke(controller, content1);
        Boolean result2 = (Boolean) method.invoke(controller, content2);

        assertFalse(result1);
        assertTrue(result2);
    }

    @Test 
    void testGenerateUniqueFilename() throws NoSuchMethodException, SecurityException, IllegalAccessException, InvocationTargetException{
        ImageUploadController controller = new ImageUploadController();

        java.lang.reflect.Method method = ImageUploadController.class.getDeclaredMethod(
            "generateUniqueFilename",
            String.class
        );
        method.setAccessible(true);

        String result1 = (String)method.invoke(controller,"photo.png");
        String result2 = (String)method.invoke(controller,"image.jpg");
        String result3 = (String)method.invoke(controller,(String)null);

        assertTrue(result1.endsWith(".png"));
        assertTrue(result2.endsWith(".jpg"));
        assertTrue(result3.endsWith(".png"));

        assertNotEquals(result1, result2); 

    }

    @Test
    void testUploadImageEmptyFile() {
        ImageUploadController controller = new ImageUploadController();

        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "",
            "image/png",
            new byte[0]
        );

        ResponseEntity<java.util.Map<String,String>> response = controller.uploadImage(emptyFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty", response.getBody().get("error"));
    }


}
