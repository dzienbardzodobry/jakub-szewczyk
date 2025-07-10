import java.io.IOException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Menu menu = new Menu();
        Klient klient = new Klient(111111111, "KUL");
        Kelner kelner = new Kelner("Anna", "Nowak");
        Kucharz kucharz = new Kucharz("Jan", "Kowalski");
        boolean exit = false;

        System.out.println("Witamy w systemie gastronomii!");

        while (!exit) {
            System.out.println("\nWybierz opcję:");
            System.out.println("1. Klient");
            System.out.println("2. Kucharz");
            System.out.println("3. Pokaż menu");
            System.out.println("4. Kelner");
            System.out.println("5. Wyjście");
            System.out.print("Wybierz opcje: ");

            int option = scanner.nextInt();

            switch (option) {
                case 1:
                    try {
                        klient.obslugaKlienta(menu);
                    } catch (IOException e) {
                        System.out.println("Wystąpił problem z plikiem zamówień.");
                        e.printStackTrace();
                    }
                    break;
                case 2:
                    System.out.println("Opcje kucharza:");
                    System.out.println("a. Pokaż listę zamówień");
                    System.out.println("b. Zrealizuj zamówienie");
                    scanner.nextLine();
                    String chefOption = scanner.nextLine();
                    if ("a".equalsIgnoreCase(chefOption)) {
                        kucharz.przygotujPosilek();

                    } if ("b".equalsIgnoreCase(chefOption)) {
                        System.out.println("Podaj numer zamówienia do realizacji:");
                        int orderToComplete = scanner.nextInt();
                        try {
                            kucharz.wydajZamowienie(orderToComplete);
                        } catch (IOException e) {
                            System.out.println("Wystąpił problem przy realizacji zamówienia.");
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("Kontynuacja.");
                    }
                    break;
                case 3:
                    menu.displayMenu();
                    break;
                case 4:
                    System.out.println("Opcje kelnera:");
                    System.out.println("a. Wyświetl listy przewozowe");
                    System.out.println("b. Drukuj listy przewozowe");
                    scanner.nextLine();
                    String waiterOption = scanner.nextLine();
                    if ("a".equalsIgnoreCase(waiterOption)) {
                        kelner.wyswietlListyPrzewozowe();
                    } else if ("b".equalsIgnoreCase(waiterOption)) {
                        kelner.drukujListyPrzewozowe();
                    } else {
                        System.out.println("Niepoprawna opcja.");
                    }
                    break;
                case 5:
                    exit = true;
                    System.out.println("Wychodzenie z systemu. Do zobaczenia!");
                    break;
                default:
                    System.out.println("Niepoprawna opcja.");
            }
        }

        scanner.close();
    }
}
