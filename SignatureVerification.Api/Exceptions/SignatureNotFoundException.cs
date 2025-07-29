namespace SignatureVerification.Api.Exceptions;

public class SignatureNotFoundException : Exception
{
    public SignatureNotFoundException() : base("Nessuna signature identificata")
    {
    }
}
