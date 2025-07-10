import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Menu {
    private List<String> items;

    public Menu() {
        items = new ArrayList<>();
        loadMenuFromFile("menu.txt");
    }
    private void loadMenuFromFile(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                items.add(line); // Add each line as a separate menu item.
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void displayMenu() {
        for (int i = 0; i < items.size(); i++) {
            System.out.println((i + 1) + ". " + items.get(i)); // Display each item with a number.
        }
    }

    public String getMenuItem(int index) {
        if (index >= 0 && index < items.size()) {
            return items.get(index);
        } else {
            System.out.println("Niepoprawny numer dania.");
            return null; // Return null if the index is out of bounds.
        }
    }
}