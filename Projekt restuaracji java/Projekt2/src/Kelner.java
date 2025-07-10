import java.io.*;

public class Kelner extends Pracownik {
    public Kelner(String imie, String nazwisko) {
        super(imie, nazwisko);
    }

    public void wyswietlListyPrzewozowe() {
        try {
            File file = new File("listyprzewozowe.txt");
            BufferedReader reader = new BufferedReader(new FileReader(file));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            reader.close();
        } catch (IOException e) {
            System.out.println("Wystąpił błąd podczas odczytywania list przewozowych.");
            e.printStackTrace();
        }
    }

    public void drukujListyPrzewozowe() {
        try {
            File file = new File("listyprzewozowe.txt");
            BufferedReader reader = new BufferedReader(new FileReader(file));
            String line;

            System.out.println("============================================");
            System.out.println("              LISTY PRZEWOZOWE        ");
            System.out.println("============================================");

            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                System.out.println("----------------------------------");
                for (String part : parts) {
                    System.out.printf("%-20s\n", part.trim());
                }
                System.out.println("----------------------------------");
            }

            System.out.println("============================================");

            reader.close();
        } catch (IOException e) {
            System.out.println("Wystąpił błąd podczas odczytywania list przewozowych.");
            e.printStackTrace();
        }
    }
}
