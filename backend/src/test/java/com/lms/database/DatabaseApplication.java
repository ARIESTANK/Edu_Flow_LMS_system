package com.lms.database;

import com.lms.backend.BackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = BackendApplication.class)
class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void databaseConnectionTest() throws Exception {

        assertNotNull(dataSource);

        try (Connection connection = dataSource.getConnection()) {

            System.out.println("====================================");
            System.out.println("DATABASE CONNECTION SUCCESS");
            System.out.println("====================================");

            System.out.println(
                    "Database: " +
                    connection.getMetaData().getDatabaseProductName()
            );

            System.out.println(
                    "Version: " +
                    connection.getMetaData().getDatabaseProductVersion()
            );

            System.out.println(
                    "URL: " +
                    connection.getMetaData().getURL()
            );

            System.out.println(
                    "User: " +
                    connection.getMetaData().getUserName()
            );

            System.out.println("====================================");
        }
    }
}
//passed