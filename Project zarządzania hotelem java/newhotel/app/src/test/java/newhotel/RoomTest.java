package newhotel;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDate;

class RoomTest {

    @Test
    void bookAndCheckAvailability() {
        Room room = new Room(101, "Pojedynczy", 200.0, 1);
        LocalDate date = LocalDate.now();

        // Sprawdzenie, czy pokój jest początkowo dostępny
        assertTrue(room.isAvailable(date), "Pokój powinien być dostępny.");

        // Rezerwacja pokoju
        room.bookDate(date);

        // Sprawdzenie, czy pokój nie jest dostępny po rezerwacji
        assertFalse(room.isAvailable(date), "Pokój nie powinien być dostępny po rezerwacji.");

        // Unbookowanie pokoju
        room.unbookDate(date);

        // Sprawdzenie, czy pokój jest ponownie dostępny
        assertTrue(room.isAvailable(date), "Pokój powinien być ponownie dostępny po unbookowaniu.");
    }

    @Test
    void checkRoomDetails() {
        Room room = new Room(102, "Podwójny", 300.0, 2);

        assertEquals(102, room.getRoomNumber(), "Numer pokoju powinien być 102.");
        assertEquals("Podwójny", room.getRoomType(), "Typ pokoju powinien być 'Podwójny'.");
        assertEquals(300.0, room.getPricePerNight(), "Cena za noc powinna wynosić 300.0.");
        assertEquals(2, room.getCapacity(), "Pojemność pokoju powinna wynosić 2.");
    }
}
