Tools Used:

    - Maven : General build tool used for the Project, which is to be written in java

    - SpringBoot : Web app framework used to facilitate development

    - JUnit : For basic unit testing

    - Mockito : For mocking (service tests and also some potential unit tests)

    - Selenium : For end-to-end testing, in the actual UI

    - Cucumber : BDD tests (for automating scenario testing, with some junit support)

    - Jacoco : For measuring test coverage and assuring that the whole of the code is evaluated by our tests

    - SonarQube : for constant testing of the projects quality, through static code analysis, as is to be determined

    - K6 : Performance testing, by simulating multiple users using the same functions at the same time

Project Tracking:

    - Github : For keeping a repository containing the project's code and documentation

    - Jira : To organize user stories, epics (and whatever else), and keep the team organized

    - Xray : Jira plugin that helps keep track of the tests

CI Pipeline:

    GitHub Action : Continuous Development tool (explained elsewhere)

Project Approach:

    Our Project is to be made in java, and it is a Web App that serves to allow a user to book (or submit for booking), any videogames that they have.

Practices practiced:

    - In Jira, the project is separated into Iterations, each lasting a week, and every Iteration is already defined before starting the first one (second one, we are a bit late). Every week the group must reunite, verify that every aspect of the current Iteration is taken care of, distribute tasks, and start the next one

    - Every time a commit is made (on GitHub), the entire team must be notified of it (assuming significant changes were made), and besides the automated tests, each member must report any thing that may be problematic, or that warrants a fix
    
    - A specific coding task is considered "Done", when it meets the following criteria:

        - All the tests pass

        - Jacoco's code coverage requirements are met

        - SonarQube's report is clean (as much as possible)

        - It properly matches a user story

