namespace Knuizz.Api.Application.Exceptions;

/// <summary>
///     Represents an error that occurs when attempting to register a user that already exists.
/// </summary>
public class DuplicateUserException : Exception {
    public DuplicateUserException(string message) : base(message) { }
}