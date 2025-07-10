package newhotel;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Event {
    private String name;
    private LocalDate date;
    private String description;

    public Event(String name, LocalDate date, String description) {
        this.name = name;
        this.date = date;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return "Wydarzenie: " + name + "\nData: " + date.format(DateTimeFormatter.ISO_LOCAL_DATE) + "\nOpis: " + description;
    }
}
