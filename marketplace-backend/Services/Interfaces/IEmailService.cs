namespace MarketPlace.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendPasswordResetEmailAsync(string toEmail, string recipientName, string verificationCode);
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
    }
}