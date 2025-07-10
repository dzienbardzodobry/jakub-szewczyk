package newhotel;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
public class Room {
    private int roomNumber;
    private String roomType;
    private boolean isAvailable;
    private Set<LocalDate> bookedDates;
    private double pricePerNight;
    private int capacity;

    public Room(int roomNumber, String roomType, double pricePerNight, int capacity) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.bookedDates = new HashSet<>();
        this.isAvailable = true;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
    }

    // Gettery i settery
    public double getPricePerNight() {
        return pricePerNight;
    }

    public void unbookDate(LocalDate date) {
        bookedDates.remove(date);
    }
    public int getCapacity(){
        return capacity;
    }

    public int getRoomNumber() {
        return roomNumber;
    }

    public String getRoomStatus() {
        if (bookedDates.isEmpty()) {
            return "Pokój dostępny";
        } else {
            String bookedDatesString = bookedDates.stream()
                    .map(LocalDate::toString)
                    .collect(Collectors.joining(", "));
            return "Pokój niedostępny w dniach: " + bookedDatesString;
        }
    }

    public String getRoomType() {
        return roomType;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    @Override
    public String toString() {
        return "Pokój nr " + roomNumber + " (" + roomType + ")";
    }

    public boolean isAvailable(LocalDate date) {
        return !bookedDates.contains(date);
    }

    public void bookDate(LocalDate date) {
        bookedDates.add(date);
    }
}