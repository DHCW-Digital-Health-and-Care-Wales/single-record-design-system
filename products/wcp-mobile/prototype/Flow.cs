namespace WcpPrototype;

/// <summary>
/// Where the user is in the onboarding flow. In memory only: there is no
/// backend and no database.
///
/// One value survives a restart, in Preferences: whether a PIN has been set,
/// so that relaunching the app opens "Welcome back" rather than starting over.
/// The PIN itself is never stored. After a restart any six digits unlock,
/// which is honest for a prototype and avoids writing a credential to disk.
/// </summary>
public static class Flow
{
    const string PinSetKey = "pin_set";

    static string? pin;

    public static bool SignedIn { get; private set; }

    /// <summary>Set once a new PIN is saved; Home shows a success banner, then clears it.</summary>
    public static bool ShowPinSetConfirmation { get; set; }

    public static bool HasPin => Preferences.Default.Get(PinSetKey, false);

    public static void SetPin(string value)
    {
        pin = value;
        Preferences.Default.Set(PinSetKey, true);
    }

    /// <summary>True if the PIN matches the one set this session, or, after a
    /// restart, if it is any six digits (the real one is not kept).</summary>
    public static bool CheckPin(string value) => pin is null ? value.Length == 6 : value == pin;

    public static void Unlocked()
    {
        SignedIn = true;
        ResetPinFailures();
    }

    /// <summary>Wrong PINs allowed before the user must sign in again
    /// (design lead, 2026-11-09).</summary>
    public const int MaxPinAttempts = 5;

    const string FailuresKey = "pin_failures";

    /// <summary>Wrong PINs so far. Kept across restarts, so closing the app
    /// does not reset the count.</summary>
    public static int PinFailures
    {
        get => Preferences.Default.Get(FailuresKey, 0);
        private set => Preferences.Default.Set(FailuresKey, value);
    }

    public static int RecordPinFailure() => ++PinFailures;

    public static void ResetPinFailures() => Preferences.Default.Remove(FailuresKey);

    /// <summary>Shown on the login screen after a forced sign-out, then cleared.</summary>
    public static string? LoginMessage { get; set; }

    public static void LogOut(string? reason = null)
    {
        pin = null;
        SignedIn = false;
        Preferences.Default.Remove(PinSetKey);
        ResetPinFailures();
        LoginMessage = reason;
        Go(() => new Views.LoginPage());
    }

    /// <summary>
    /// Replace the whole page. The sign-in steps are a one-way flow, so there
    /// is no back stack to keep: Android's back button cannot return to a
    /// password or PIN step that has already been passed.
    /// </summary>
    public static void Go(Func<Page> make)
    {
        var window = Application.Current?.Windows.FirstOrDefault();
        if (window is null) return;
        try { window.Page = make(); }
        catch (Exception ex) { window.Page = ErrorPage.For(ex); }
    }
}
