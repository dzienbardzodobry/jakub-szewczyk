package newhotel;

import java.util.Scanner;
import java.util.HashMap;
import java.util.Map;
import java.io.*;

public class Main {
    private static final String EMPLOYEE_PASSWORD = "pracownik554";
    private static final String USER_DATA_FILE = "users.txt";
    private static Map<String, String> customerAccounts = new HashMap<>();

    private static EventManager eventManager = new EventManager();

    public static void main(String[] args) {

        eventManager.loadEventsFromFile();

        Scanner scanner = new Scanner(System.in);
        ReservationManager reservationManager = new ReservationManager();

        loadUserData();  // Wczytaj dane użytkowników na początku
        reservationManager.loadReservationsFromFile("reservations.txt");
        Message.loadMessages();
        User currentUser = null;
        while (currentUser == null) {
            System.out.print("Login as (employee/customer): ");
            String userType = scanner.nextLine();

            if (userType.equalsIgnoreCase("employee")) {
                System.out.print("Enter employee password: ");
                String password = scanner.nextLine();
                if (password.equals(EMPLOYEE_PASSWORD)) {
                    currentUser = new Employee("employee");
                } else {
                    System.out.println("Incorrect password.");
                }
            } else if (userType.equalsIgnoreCase("customer")) {
                currentUser = handleCustomerLogin(scanner);
            }
        }

        while (true) {
            if (currentUser.getUserType() == UserType.EMPLOYEE) {
                showEmployeeMenu();
            } else {
                showCustomerMenu();
            }

            System.out.print("Wybierz opcję: ");
            int choice = scanner.nextInt();
            scanner.nextLine();

            switch (choice) {
                case 1:
                    if (currentUser.getUserType() == UserType.EMPLOYEE) {
                        reservationManager.addReservation();
                    } else {
                        reservationManager.addCustomerReservation(currentUser.getUsername());
                    }
                    break;
                case 2:
                    if (currentUser.getUserType() == UserType.EMPLOYEE) {
                        reservationManager.showReservations();
                    } else {
                        reservationManager.showCustomerReservations(currentUser.getUsername());
                    }
                    break;
                case 3:
                    if (currentUser.getUserType() == UserType.EMPLOYEE) {
                        reservationManager.removeReservation();
                    }
                    break;
                case 4:
                    if (currentUser.getUserType() == UserType.EMPLOYEE) {
                        reservationManager.searchReservation();
                    }
                    break;
                case 5:
                    if (currentUser.getUserType() == UserType.EMPLOYEE) {
                        reservationManager.showRoomStatus();
                    }
                    break;
                case 6:
                    saveUserData();
                    reservationManager.saveReservationsToFile("reservations.txt");
                    System.exit(0);
                    break;
                case 7:
                    Message.showMessages(currentUser.getUsername(), scanner);
                    if (currentUser.getUserType() == UserType.CUSTOMER) {
                        System.out.print("Chcesz wysłać wiadomość do recepcji? (tak/nie): ");
                        String answer = scanner.nextLine();
                        if (answer.equalsIgnoreCase("tak")) {
                            System.out.print("Wpisz treść wiadomości: ");
                            String messageContent = scanner.nextLine();
                            Message.sendMessage(currentUser.getUsername(), "employee", messageContent);
                        }
                    }
                    break;
                case 8:
                    if (currentUser.getUserType() == UserType.EMPLOYEE) {
                        eventManager.addEvent();
                    } else {
                        eventManager.showEvents();
                    }
                    break;
                default:
                    System.out.println("Nieprawidłowa opcja, spróbuj ponownie.");
            }
        }
    }

    private static void showEmployeeMenu() {
        System.out.println("Menu Pracownika:");
        System.out.println("1. Dodaj Rezerwację");
        System.out.println("2. Pokaż Wszystkie Rezerwacje");
        System.out.println("3. Usuń Rezerwację");
        System.out.println("4. Wyszukaj Rezerwację");
        System.out.println("5. Pokaż Stan Pokoi");
        System.out.println("6. Zapisz i wyjdź");
        System.out.println("7. Zarządzaj wiadomościami");
        System.out.println("8. Zarządzaj wydarzeniami");
    }

    private static void showCustomerMenu() {
        System.out.println("Menu Klienta:");
        System.out.println("1. Dodaj Rezerwację");
        System.out.println("2. Pokaż Moje Rezerwacje");
        System.out.println("6. Wyjdź");
        System.out.println("7. Zarządzaj wiadomościami");
        System.out.println("8. Przeglądaj wydarzenia");
    }

    private static User handleCustomerLogin(Scanner scanner) {
        while (true) {
            System.out.print("Login or Register (login/register): ");
            String action = scanner.nextLine();

            if (action.equalsIgnoreCase("login")) {
                System.out.print("Enter username: ");
                String username = scanner.nextLine();
                System.out.print("Enter password: ");
                String password = scanner.nextLine();

                if (customerAccounts.containsKey(username) && customerAccounts.get(username).equals(password)) {
                    return new Customer(username);
                } else {
                    System.out.println("Incorrect username or password.");
                }
            } else if (action.equalsIgnoreCase("register")) {
                System.out.print("Choose a username: ");
                String newUsername = scanner.nextLine();
                if (customerAccounts.containsKey(newUsername)) {
                    System.out.println("Podane Nazwisko jest już zarejestrowane w systemie. Jeżeli to nie Ty, to proszę podać nazwisko wraz z imieniem.");
                    continue;
                }
                System.out.print("Choose a password: ");
                String newPassword = scanner.nextLine();
                customerAccounts.put(newUsername, newPassword);
                return new Customer(newUsername);
            }
        }
    }

    private static void saveUserData() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(USER_DATA_FILE))) {
            for (Map.Entry<String, String> entry : customerAccounts.entrySet()) {
                writer.write(entry.getKey() + ":" + entry.getValue() + "\n");
            }
        } catch (IOException e) {
            System.out.println("Error saving user data: " + e.getMessage());
        }
    }

    private static void loadUserData() {
        try (BufferedReader reader = new BufferedReader(new FileReader(USER_DATA_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(":");
                if (parts.length == 2) {
                    customerAccounts.put(parts[0], parts[1]);
                }
            }
        } catch (IOException e) {
            System.out.println("Error loading user data: " + e.getMessage());
        }
    }


}
