package newhotel;

public class Customer extends User {
    public Customer(String username) {
        super(username, UserType.CUSTOMER);
    }

    // Dodatkowe metody specyficzne dla klienta, jeśli są potrzebne
}
