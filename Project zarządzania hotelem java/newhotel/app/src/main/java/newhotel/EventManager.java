package newhotel;

import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class EventManager {
    private static final String EVENTS_FILE = "events.txt";
    private List<Event> events;
    private Scanner scanner;

    public EventManager() {
        events = new ArrayList<>();
        scanner = new Scanner(System.in);
        loadEventsFromFile();
    }

    public void saveEventsToFile() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(EVENTS_FILE))) {
            for (Event event : events) {
                writer.write(event.getName() + ":" + event.getDate().toString() + ":" + event.getDescription() + "\n");
            }
        } catch (IOException e) {
            System.out.println("Error saving events: " + e.getMessage());
        }
    }

    public void loadEventsFromFile() {
        File file = new File(EVENTS_FILE);

        // Sprawdź, czy plik istnieje. Jeśli nie, utwórz nowy pusty plik.
        if (!file.exists()) {
            System.out.println("Plik z wydarzeniami nie istnieje. Tworzenie nowego pliku.");
            try {
                file.createNewFile();
            } catch (IOException e) {
                System.out.println("Nie można utworzyć pliku: " + e.getMessage());
                return;
            }
        }

        // Kontynuuj wczytywanie danych z pliku.
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(":");
                if (parts.length >= 3) {
                    String name = parts[0];
                    LocalDate date = LocalDate.parse(parts[1], DateTimeFormatter.ISO_LOCAL_DATE);
                    String description = parts[2];
                    events.add(new Event(name, date, description));
                }
            }
        } catch (IOException e) {
            System.out.println("Error loading events: " + e.getMessage());
        }
    }

    public void addEvent() {
        System.out.print("Wpisz nazwę wydarzenia: ");
        String name = scanner.nextLine();
        System.out.print("Wpisz datę wydarzenia (format RRRR-MM-DD): ");
        String dateString = scanner.nextLine();
        LocalDate date;
        try {
            date = LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            System.out.println("Nieprawidłowy format daty. Spróbuj ponownie.");
            return;
        }
        System.out.print("Wpisz opis wydarzenia: ");
        String description = scanner.nextLine();

        Event event = new Event(name, date, description);
        events.add(event);
        System.out.println("Wydarzenie dodane pomyślnie.");
    }

    public void showEvents() {
        if (events.isEmpty()) {
            System.out.println("Brak nadchodzących wydarzeń.");
        } else {
            System.out.println("Nadchodzące wydarzenia:");
            for (Event event : events) {
                System.out.println(event);
                System.out.println();
            }
        }
    }
}
