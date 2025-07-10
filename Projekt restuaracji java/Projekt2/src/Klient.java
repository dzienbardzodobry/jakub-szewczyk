import java.io.*;
import java.util.Scanner;

public class Klient {
    private int nrTelefonu;
    private String adres;

    public Klient(int nrTelefonu, String adres) {
        this.nrTelefonu = nrTelefonu;
        this.adres = adres;
    }
    public void obslugaKlienta(Menu menu) throws IOException {
        Scanner scanner = new Scanner(System.in);
        System.out.println("1. Złóż zamówienie");
        System.out.println("2. Zobacz status zamówienia");
        int wyborKlienta = scanner.nextInt();

        if (wyborKlienta == 1) {
            zlozZamowienie(menu);
        } else if (wyborKlienta == 2) {
            System.out.println("Podaj ID zamówienia do sprawdzenia:");
            int idZamowienia = scanner.nextInt();
            sprawdzStatusZamowienia(idZamowienia);
        } else {
            System.out.println("Niepoprawna opcja. Proszę wybrać 1 lub 2.");
        }
    }
    public void zlozZamowienie(Menu menu) throws IOException {
        menu.displayMenu();
        Scanner scanner = new Scanner(System.in);
        int menuOption = 0;

        do {
            System.out.println("Wybierz numer dania z menu (1-11):");
            while (!scanner.hasNextInt()) {
                System.out.println("To nie jest numer. Podaj numer dania:");
                scanner.next();
            }
            menuOption = scanner.nextInt();
        } while (menuOption < 1 || menuOption > 11);

        scanner.nextLine();

        System.out.println("Podaj adres dostawy:");
        this.adres = scanner.nextLine();

        System.out.println("Podaj numer telefonu:");
        while (true) {
            if (scanner.hasNextInt()) {
                this.nrTelefonu = scanner.nextInt();
                if (String.valueOf(this.nrTelefonu).length() == 9) {
                    break;
                } else {
                    System.out.println("Numer telefonu musi składać się z 9 cyfr. Podaj numer telefonu:");
                }
            } else {
                System.out.println("To nie jest numer telefonu. Podaj numer telefonu:");
                scanner.next();
            }
        }

        String chosenDish = menu.getMenuItem(menuOption - 1);
        int orderId = appendOrderToFile(chosenDish, adres, nrTelefonu);
        System.out.println("Twoje zamówienie zostało złożone. Numer ID zamówienia: " + orderId);

    }

    private int appendOrderToFile(String dish, String address, int phoneNumber) throws IOException {
        File ordersFile = new File("zamowienia.txt");
        File deliveryFile = new File("listyprzewozowe.txt");

        // Create files if they don't exist
        if (!ordersFile.exists()) {
            ordersFile.createNewFile();
        }
        if (!deliveryFile.exists()) {
            deliveryFile.createNewFile();
        }

        // Determine the next order ID
        int orderId = determineNextOrderId(ordersFile);

        // Write the order details to both files
        try (BufferedWriter ordersWriter = new BufferedWriter(new FileWriter(ordersFile, true));
             BufferedWriter deliveryWriter = new BufferedWriter(new FileWriter(deliveryFile, true))) {
            String orderEntry = orderId + ". Danie: " + dish + ", Status: Oplacone\n";
            String deliveryEntry = orderId + ". Adres: " + address + ", Telefon: " + phoneNumber + ", Status: Oplacone\n";

            ordersWriter.write(orderEntry);
            deliveryWriter.write(deliveryEntry);
        }

        return orderId;
    }

    private int determineNextOrderId(File ordersFile) throws IOException {
        int orderId = 1;
        try (BufferedReader reader = new BufferedReader(new FileReader(ordersFile))) {
            String lastLine = "";
            String line;
            while ((line = reader.readLine()) != null) {
                lastLine = line;
            }
            if (!lastLine.isEmpty()) {
                String[] parts = lastLine.split("\\.");
                orderId = Integer.parseInt(parts[0].trim()) + 1;
            }
        }
        return orderId;
    }

    public void sprawdzStatusZamowienia(int idZamowienia) {
        File file = new File("zamowienia.txt");
        boolean znalezionoZamowienie = false;

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith(idZamowienia + ".")) {
                    znalezionoZamowienie = true;
                    break;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (znalezionoZamowienie) {
            System.out.println("Status zamówienia " + idZamowienia + ": W trakcie robienia.");
        } else {
            System.out.println("Zamówienie " + idZamowienia + " nie istnieje.");
        }
    }
}