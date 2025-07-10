package newhotel;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.stream.IntStream;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.stream.Collectors;

public class ReservationManager {
    private static final String MESSAGES_FILE = "messages.txt";
    private List<String> reservations;
    private List<Room> rooms;
    private Scanner scanner;
    private List<Message> messages;
    public ReservationManager() {

        reservations = new ArrayList<>();
        rooms = new ArrayList<>();
        scanner = new Scanner(System.in);
        messages = new ArrayList<>();

        rooms.add(new Room(101, "Pojedynczy", 115.0, 1));
        rooms.add(new Room(102, "Podwójny", 200.0, 2));
        rooms.add(new Room(103, "Apartament 5 osobowy", 450.0, 5));
        rooms.add(new Room(104, "Pojedynczy", 115.0, 1));
        rooms.add(new Room(105, "Podwójny", 200.0, 2));
        rooms.add(new Room(106, "Apartament 5 osobowy", 450.0, 5));
        rooms.add(new Room(107, "Apartament 8 osobowy", 600.0, 8));
        rooms.add(new Room(108, "Apartament Deluxe 5 osobowy", 650.0, 5));


    }

    public boolean hasReservation(String reservationInfo) {
        return reservations.contains(reservationInfo);
    }







    public void addReservation() {
        LocalDate startDate = null;

        while (true) {
            System.out.print("Podaj datę rozpoczęcia rezerwacji (format RRRR-MM-DD): ");
            String startDateInput = scanner.nextLine();

            try {
                startDate = LocalDate.parse(startDateInput, DateTimeFormatter.ISO_LOCAL_DATE);
                break;
            } catch (DateTimeParseException e) {
                System.out.println("Nieprawidłowy format daty. Spróbuj ponownie.");
            }
        }
        final LocalDate finalStartDate = startDate;

        int numberOfPeople = getSafeIntInput("Podaj liczbę osób: ");

        double maxPrice = getSafeDoubleInput("Podaj maksymalną cenę za dobę: ");



        System.out.print("Podaj nazwisko rezerwacji: ");
        String reservationName = scanner.nextLine();

        List<Room> availableRooms = rooms.stream()
                .filter(r -> r.isAvailable(finalStartDate) && r.getCapacity() >= numberOfPeople && r.getPricePerNight() <= maxPrice)
                .collect(Collectors.toList());
        if (availableRooms.isEmpty()) {
            System.out.println("Brak dostępnych pokoi spełniających kryteria.");
            return;
        }

        System.out.println("Dostępne pokoje:");
        availableRooms.forEach(r -> System.out.println("Pokój nr " + r.getRoomNumber() + " (" + r.getRoomType() + ", cena za noc: " + r.getPricePerNight() + " zł, pojemność: " + r.getCapacity() + " osób)"));

        int roomNumber = getSafeIntInput("Wybierz numer pokoju do rezerwacji: ");
        Room selectedRoom = availableRooms.stream()
                .filter(r -> r.getRoomNumber() == roomNumber)
                .findFirst()
                .orElse(null);

        if (selectedRoom == null) {
            System.out.println("Nieprawidłowy wybór pokoju.");
            return;
        }

        int numberOfDays = getSafeIntInput("Podaj liczbę dni rezerwacji: ");

        boolean isAvailable = IntStream.range(0, numberOfDays)
                .mapToObj(startDate::plusDays)
                .allMatch(selectedRoom::isAvailable);

        if (!isAvailable) {
            System.out.println("Pokój nie jest dostępny w wybrane dni.");
            return;
        }

        IntStream.range(0, numberOfDays)
                .mapToObj(startDate::plusDays)
                .forEach(selectedRoom::bookDate);

        double totalCost = numberOfDays * selectedRoom.getPricePerNight();
        reservations.add(reservationName + " - Pokój nr " + selectedRoom.getRoomNumber() + " - " + startDate + " na " + numberOfDays + " dni - Koszt: " + totalCost + " zł");
        System.out.println("Rezerwacja dodana pomyślnie. Całkowity koszt: " + totalCost + " zł");
    }


    public void showRoomStatus() {
        System.out.println("Stan pokoi:");
        for (Room room : rooms) {
            System.out.println("Pokój nr " + room.getRoomNumber() + " (" + room.getRoomType() + ") - " + room.getPricePerNight() + " zł) - " + room.getRoomStatus());
        }}

    private int getSafeIntInput(String prompt) {
        while (true) {
            System.out.print(prompt);
            if (scanner.hasNextInt()) {
                return scanner.nextInt();
            } else {
                System.out.println("To nie jest prawidłowa liczba, spróbuj ponownie.");
                scanner.next(); // Wyrzuć nieprawidłową wartość
            }
        }
    }
    private double getSafeDoubleInput(String prompt) {
        while (true) {
            System.out.print(prompt);
            if (scanner.hasNextDouble()) {
                double value = scanner.nextDouble();
                scanner.nextLine(); // Wyczyszczenie bufora po odczytaniu liczby typu double
                return value;
            } else {
                System.out.println("To nie jest prawidłowa liczba, spróbuj ponownie.");
                scanner.next(); // Wyrzuć nieprawidłową wartość
            }
        }
    }



    public void saveReservationsToFile(String filename) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (String reservation : reservations) {
                writer.write(reservation + "\n");
            }
        } catch (IOException e) {
            System.out.println("Wystąpił błąd przy zapisie do pliku: " + e.getMessage());
        }
    }

    public void loadReservationsFromFile(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(" - ");
                if (parts.length < 4) continue; // Pomijamy niekompletne dane

                String reservationName = parts[0];
                int roomNumber = Integer.parseInt(parts[1].split(" ")[2]);
                String[] dateParts = parts[2].split(" na ");
                LocalDate startDate = LocalDate.parse(dateParts[0].trim(), DateTimeFormatter.ISO_LOCAL_DATE);
                int numberOfDays = Integer.parseInt(dateParts[1].split(" ")[0]);

                Room selectedRoom = rooms.stream()
                        .filter(r -> r.getRoomNumber() == roomNumber)
                        .findFirst()
                        .orElse(null);

                if(selectedRoom != null) {
                    for (int i = 0; i < numberOfDays; i++) {
                        selectedRoom.bookDate(startDate.plusDays(i));
                    }
                }reservations.add(line);
            }
        } catch (IOException e) {
            System.out.println("Wystąpił błąd przy odczycie z pliku: " + e.getMessage());
        }
    }





    public void showReservations() {
        if (reservations.isEmpty()) {
            System.out.println("Brak rezerwacji.");
        } else {
            System.out.println("Rezerwacje:");
            for (int i = 0; i < reservations.size(); i++) {
                System.out.println((i + 1) + ". " + reservations.get(i));
            }
        }
    }

    public void removeReservation() {
        if (reservations.isEmpty()) {
            System.out.println("Brak rezerwacji do usunięcia.");
            return;
        }

        showReservations();
        int index = getSafeIntInput("Wybierz numer rezerwacji do usunięcia: ");

        if (index >= 1 && index <= reservations.size()) {
            String reservation = reservations.remove(index - 1);
            String[] splitReservation = reservation.split(" - ");

            if (splitReservation.length > 3) {
                int roomNumber = Integer.parseInt(splitReservation[1].split(" ")[2]);
                String[] dateParts = splitReservation[2].split(" na ");
                LocalDate startDate = LocalDate.parse(dateParts[0].trim(), DateTimeFormatter.ISO_LOCAL_DATE);
                int numberOfDays = Integer.parseInt(dateParts[1].split(" ")[0]);

                Room selectedRoom = rooms.stream()
                        .filter(r -> r.getRoomNumber() == roomNumber)
                        .findFirst()
                        .orElse(null);

                if (selectedRoom != null) {
                    for (int i = 0; i < numberOfDays; i++) {
                        selectedRoom.unbookDate(startDate.plusDays(i));
                    }
                }
            }

            System.out.println("Rezerwacja została usunięta.");
        } else {
            System.out.println("Nieprawidłowy numer rezerwacji.");
        }
    }

    public void searchReservation() {
        System.out.print("Podaj nazwisko do wyszukania: ");
        String searchQuery = scanner.nextLine();
        boolean found = false;

        System.out.println("Wyniki wyszukiwania dla \"" + searchQuery + "\":");
        for (int i = 0; i < reservations.size(); i++) {
            if (reservations.get(i).toLowerCase().contains(searchQuery.toLowerCase())) {
                System.out.println((i + 1) + ". " + reservations.get(i));
                found = true;
            }
        }

        if (!found) {
            System.out.println("Brak rezerwacji pasujących do podanego kryterium.");
        }
    }

    public void addCustomerReservation(String username) {
        System.out.print("Podaj datę rozpoczęcia rezerwacji (format RRRR-MM-DD): ");
        String startDateInput = scanner.nextLine();
        LocalDate startDate;
        try {
            startDate = LocalDate.parse(startDateInput, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            System.out.println("Nieprawidłowy format daty.");
            return;
        }

        int numberOfPeople = getSafeIntInput("Podaj liczbę osób: ");
        double maxPrice = getSafeDoubleInput("Podaj maksymalną cenę za dobę: ");

        List<Room> availableRooms = rooms.stream()
                .filter(r -> r.isAvailable(startDate) && r.getCapacity() >= numberOfPeople && r.getPricePerNight() <= maxPrice)
                .collect(Collectors.toList());

        if (availableRooms.isEmpty()) {
            System.out.println("Brak dostępnych pokoi spełniających kryteria.");
            return;
        }

        System.out.println("Dostępne pokoje:");
        availableRooms.forEach(r -> System.out.println("Pokój nr " + r.getRoomNumber() + " (" + r.getRoomType() + ", cena za noc: " + r.getPricePerNight() + " zł, pojemność: " + r.getCapacity() + " osób)"));

        int roomNumber = getSafeIntInput("Wybierz numer pokoju do rezerwacji: ");
        Room selectedRoom = availableRooms.stream()
                .filter(r -> r.getRoomNumber() == roomNumber)
                .findFirst()
                .orElse(null);

        if (selectedRoom == null) {
            System.out.println("Nieprawidłowy wybór pokoju.");
            return;
        }

        int numberOfDays = getSafeIntInput("Podaj liczbę dni rezerwacji: ");
        boolean isAvailable = IntStream.range(0, numberOfDays)
                .mapToObj(startDate::plusDays)
                .allMatch(selectedRoom::isAvailable);

        if (!isAvailable) {
            System.out.println("Pokój nie jest dostępny w wybrane dni.");
            return;
        }

        IntStream.range(0, numberOfDays)
                .mapToObj(startDate::plusDays)
                .forEach(selectedRoom::bookDate);

        double totalCost = numberOfDays * selectedRoom.getPricePerNight();
        reservations.add(username + " - Pokój nr " + selectedRoom.getRoomNumber() + " - " + startDate + " na " + numberOfDays + " dni - Koszt: " + totalCost + " zł");
        System.out.println("Rezerwacja dodana pomyślnie. Całkowity koszt: " + totalCost + " zł");
    }


    // Metoda wyświetlająca rezerwacje klienta
    public void showCustomerReservations(String username) {
        System.out.println("Twoje rezerwacje:");
        for (String reservation : reservations) {
            if (reservation.startsWith(username + " - ")) {
                System.out.println(reservation);
            }
        }
    }


    public void setScanner(Scanner scanner) {
        this.scanner = scanner;
    }

}

