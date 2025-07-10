import java.util.*;
import java.io.*;

public class Zamowienie {
    private List<String> orders;

    public Zamowienie() {
        orders = new ArrayList<>();
        loadOrdersFromFile("zamowienia.txt");
    }

    private void loadOrdersFromFile(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                orders.add(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void displayOrders() {
        for (int i = 0; i < orders.size(); i++) {
            System.out.println((i + 1) + ". " + orders.get(i));
        }
    }

    public void completeOrder(int orderIndex) {
        if (orderIndex >= 0 && orderIndex < orders.size()) {
            orders.remove(orderIndex);
            saveOrdersToFile("zamowienia.txt");
        } else {
            System.out.println("Brak zamowien.");
        }
    }

    private void saveOrdersToFile(String filename) {
        try (PrintWriter out = new PrintWriter(new FileWriter(filename))) {
            for (String order : orders) {
                out.println(order);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
