import java.io.*;
import java.util.*;

public class Kucharz extends Pracownik {

    public Kucharz(String imie, String nazwisko) {
        super(imie, nazwisko);
    }

    public void przygotujPosilek() {
        try {
            List<String> orders = readOrdersFromFile();
            if (orders.isEmpty()) {
                System.out.println("Brak zamówień do przygotowania.");
                return;
            }
            for (String order : orders) {
                System.out.println(order);
            }
        } catch (IOException e) {
            System.out.println("Wystąpił problem z plikiem zamówień.");
            e.printStackTrace();
        }
    }

    public void wydajZamowienie(int idZamowienia) throws IOException {
        List<String> orders = readOrdersFromFile();
        if (idZamowienia <= 0 || idZamowienia > orders.size()) {
            System.out.println("Niepoprawny numer zamówienia lub zamówienie nie istnieje.");
            return;
        }
        orders.remove(idZamowienia - 1);
        saveOrdersToFile(orders);
        System.out.println("Zamówienie numer " + idZamowienia + " zostało zrealizowane.");
    }

    private List<String> readOrdersFromFile() throws IOException {
        File file = new File("zamowienia.txt");
        List<String> orders = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                orders.add(line);
            }
        }
        return orders;
    }

    private void saveOrdersToFile(List<String> orders) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("zamowienia.txt"))) {
            for (String order : orders) {
                writer.write(order);
                writer.newLine();
            }
        }
    }
}
