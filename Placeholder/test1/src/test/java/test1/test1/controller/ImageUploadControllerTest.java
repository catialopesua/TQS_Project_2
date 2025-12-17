package test1.test1.controller;

import java.lang.reflect.InvocationTargetException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

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
    void testIsValidImageType_withJpeg() throws Exception {
        ImageUploadController controller = new ImageUploadController();

        java.lang.reflect.Method method = ImageUploadController.class.getDeclaredMethod(
            "isValidImageType",
            String.class
        );
        method.setAccessible(true);

        Boolean result = (Boolean) method.invoke(controller, "image/jpeg");

        assertTrue(result);
    }

    @Test
    void testIsValidImageType_withInvalidType() throws Exception {
        ImageUploadController controller = new ImageUploadController();

        java.lang.reflect.Method method = ImageUploadController.class.getDeclaredMethod(
            "isValidImageType",
            String.class
        );
        method.setAccessible(true);

        Boolean result = (Boolean) method.invoke(controller, "application/pdf");

        assertFalse(result);
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

    @Test
    void testUploadImage_withValidPngFile() {
        ImageUploadController controller = new ImageUploadController();

        byte[] fileContent = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}; // PNG header
        MockMultipartFile validFile = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            fileContent
        );

        ResponseEntity<java.util.Map<String,String>> response = controller.uploadImage(validFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("imagePath"));
        assertTrue(response.getBody().get("imagePath").endsWith(".png"));
    }

    @Test
    void testUploadImage_withValidJpegFile() {
        ImageUploadController controller = new ImageUploadController();

        byte[] fileContent = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}; // JPEG header
        MockMultipartFile validFile = new MockMultipartFile(
            "file",
            "test.jpg",
            "image/jpeg",
            fileContent
        );

        ResponseEntity<java.util.Map<String,String>> response = controller.uploadImage(validFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("imagePath"));
    }

    @Test
    void testUploadImage_withInvalidContentType() {
        ImageUploadController controller = new ImageUploadController();

        MockMultipartFile invalidFile = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            new byte[]{0x25, 0x50, 0x44, 0x46}
        );

        ResponseEntity<java.util.Map<String,String>> response = controller.uploadImage(invalidFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid file type. Only images are allowed", response.getBody().get("error"));
    }

    @Test
    void testUploadImage_withNoExtension() {
        ImageUploadController controller = new ImageUploadController();

        byte[] fileContent = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}; // PNG header
        MockMultipartFile validFile = new MockMultipartFile(
            "file",
            "testimage",
            "image/png",
            fileContent
        );

        ResponseEntity<java.util.Map<String,String>> response = controller.uploadImage(validFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("imagePath"));
        assertTrue(response.getBody().get("imagePath").endsWith(".png"));
    }

    @Test
    void testCreateErrorResponse() throws Exception {
        ImageUploadController controller = new ImageUploadController();

        java.lang.reflect.Method method = ImageUploadController.class.getDeclaredMethod(
            "createErrorResponse",
            String.class
        );
        method.setAccessible(true);

        java.util.Map<String, String> result = (java.util.Map<String, String>) method.invoke(controller, "Test error message");

        assertNotNull(result);
        assertEquals("Test error message", result.get("error"));
    }

    @Test
    void testCreateErrorResponse_withEmptyMessage() throws Exception {
        ImageUploadController controller = new ImageUploadController();

        java.lang.reflect.Method method = ImageUploadController.class.getDeclaredMethod(
            "createErrorResponse",
            String.class
        );
        method.setAccessible(true);

        java.util.Map<String, String> result = (java.util.Map<String, String>) method.invoke(controller, "");

        assertNotNull(result);
        assertEquals("", result.get("error"));
    }

}
