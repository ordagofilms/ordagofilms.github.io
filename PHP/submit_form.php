<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $message = htmlspecialchars(trim($_POST['message']));

    // Validate form data
    if (!empty($name) && !empty($email) && !empty($message)) {
        // Send email (example using PHP mail function)
        $to = "your_email@example.com";  // Replace with your email
        $subject = "New Contact Message from " . $name;
        $body = "You have received a new message from the contact form on your website:\n\n" .
                "Name: $name\n" .
                "Email: $email\n" .
                "Message: $message\n";

        $headers = "From: $email";

        // Send the email
        if (mail($to, $subject, $body, $headers)) {
            echo "Message sent successfully!";
        } else {
            echo "Message could not be sent. Please try again later.";
        }
    } else {
        echo "Please fill in all the fields.";
    }
} else {
    echo "Invalid request.";
}
?>
