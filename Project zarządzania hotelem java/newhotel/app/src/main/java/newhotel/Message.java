package newhotel;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Message {
    private static final String MESSAGES_FILE = "messages.txt";
    private static List<Message> messages = new ArrayList<>();
    private static Scanner scanner = new Scanner(System.in);

    private String sender;
    private String receiver;
    private String messageContent;
    private boolean isRead;
    private boolean isReplied;

    public Message(String sender, String receiver, String messageContent) {
        this.sender = sender;
        this.receiver = receiver;
        this.messageContent = messageContent;
        this.isRead = false;
        this.isReplied = false;
    }

    public void markAsReplied() {
        isReplied = true;
    }

    public boolean isReplied() {
        return isReplied;
    }

    public String getSender() {
        return sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public boolean isRead() {
        return isRead;
    }

    public void markAsRead() {
        isRead = true;
    }


    public static void sendMessage(String sender, String receiver, String messageContent) {
        Message message = new Message(sender, receiver, messageContent);
        messages.add(message);
        saveMessagesToFile();
    }

    public static void showMessages(String username, Scanner scanner) {
        int messageNumber = 0;
        List<Message> messagesToReply = new ArrayList<>();

        for (Message message : messages) {
            if (username.equals("employee") && message.getReceiver().equals(username)) {
                messageNumber++;
                System.out.println(messageNumber + ". " + message.toEmployeeString());
                messagesToReply.add(message);
            } else if (!username.equals("employee") && message.getReceiver().equals(username) && !message.getSender().equals(username)) {
                messageNumber++;
                System.out.println(messageNumber + ". " + message);
            }
        }

        if (messageNumber == 0) {
            System.out.println("Brak wiadomości.");
        } else if (username.equals("employee")) {
            System.out.print("Na którą wiadomość chcesz odpowiedzieć? (wpisz numer, 0 aby anulować): ");
            int replyNumber = scanner.nextInt();
            scanner.nextLine(); // Wyczyszczenie bufora

            if (replyNumber > 0 && replyNumber <= messagesToReply.size()) {
                Message messageToReply = messagesToReply.get(replyNumber - 1);
                handleReply(messageToReply, scanner);
            }
        }
    }

    private static void handleReply(Message messageToReply, Scanner scanner) {
        System.out.println("Odpowiadasz na wiadomość od: " + messageToReply.getSender());
        System.out.print("Wpisz treść odpowiedzi: ");
        String replyContent = scanner.nextLine();
        sendMessage("employee", messageToReply.getSender(), replyContent);

        // Zaznacz wiadomość jako odpowiedzianą
        messageToReply.markAsReplied();

        System.out.println("Wiadomość wysłana.");
        saveMessagesToFile(); // Zapisz zmiany do pliku
    }

    private static void saveMessagesToFile() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(MESSAGES_FILE))) {
            for (Message message : messages) {
                writer.write(message.getSender() + ":" + message.getReceiver() + ":" + message.getMessageContent() + ":" + message.isReplied() + "\n");
            }
        } catch (IOException e) {
            System.out.println("Error saving messages: " + e.getMessage());
        }
    }

    public static void loadMessages() {
        messages = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(MESSAGES_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(":");
                if (parts.length == 4) {
                    Message message = new Message(parts[0], parts[1], parts[2]);
                    if (parts[3].equals("true")) {
                        message.markAsReplied();
                    }
                    messages.add(message);
                }
            }
        } catch (IOException e) {
            System.out.println("Error loading messages: " + e.getMessage());
        }
    }


    @Override
    public String toString() {
        // Bazowa treść wiadomości, bez statusu odpowiedzi
        String baseMessage = "Od: " + sender + "\nDo: " + receiver + "\nTreść: " + messageContent;
        return baseMessage;
    }

    // Nowa metoda dla pracowników, włączająca status odpowiedzi
    public String toEmployeeString() {
        String baseMessage = "Od: " + sender + "\nDo: " + receiver + "\nTreść: " + messageContent;
        return baseMessage + "\nOdpowiedziano: " + isReplied;
    }}
