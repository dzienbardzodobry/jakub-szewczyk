package newhotel;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDate;
import java.util.Scanner;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class ReservationManagerTest {
    @Mock
    private Scanner mockScanner;

    private ReservationManager reservationManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reservationManager = new ReservationManager();
        reservationManager.setScanner(mockScanner);
    }

    @Test
    void testAddReservation() {
        when(mockScanner.nextLine()).thenReturn("2024-01-01", "Kowalski");
        when(mockScanner.nextInt()).thenReturn(2, 2);
        when(mockScanner.nextDouble()).thenReturn(200.0);

        reservationManager.addReservation();

        assertTrue(reservationManager.hasReservation("Kowalski - Pokój nr 102"));
    }

    @Test
    void testRemoveReservation() {
        // Dodaj rezerwację
        when(mockScanner.nextLine()).thenReturn("2024-01-01", "Nowak");
        when(mockScanner.nextInt()).thenReturn(2, 2);
        when(mockScanner.nextDouble()).thenReturn(200.0);
        reservationManager.addReservation();

        // Usuń rezerwację
        when(mockScanner.nextInt()).thenReturn(1);
        reservationManager.removeReservation();

        assertFalse(reservationManager.hasReservation("Nowak - Pokój nr 102"));
    }

    // Dodatkowe metody pomocnicze do testowania, na przykład:
    // - hasReservation(String reservationInfo)
    // - getRoomStatus(int roomNumber)
    // Możesz je zaimplementować w klasie ReservationManager lub jako metody prywatne w klasie testowej.
}
