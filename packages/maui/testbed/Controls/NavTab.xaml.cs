using System.Windows.Input;
using Microsoft.Maui.Controls.Shapes;

namespace SrTestbed.Controls;

/// <summary>
/// A bottom-bar destination. Active and inactive colours come from the design
/// system's tokens, applied as app-theme pairs so the tab follows light/dark
/// without this control knowing which mode it is in.
/// </summary>
public partial class NavTab : ContentView
{
    public static readonly BindableProperty IconDataProperty =
        BindableProperty.Create(nameof(IconData), typeof(string), typeof(NavTab), propertyChanged: OnIconChanged);

    public static readonly BindableProperty TextProperty =
        BindableProperty.Create(nameof(Text), typeof(string), typeof(NavTab), propertyChanged: OnTextChanged);

    public static readonly BindableProperty IndexProperty =
        BindableProperty.Create(nameof(Index), typeof(int), typeof(NavTab), propertyChanged: OnStateChanged);

    public static readonly BindableProperty SelectedIndexProperty =
        BindableProperty.Create(nameof(SelectedIndex), typeof(int), typeof(NavTab), propertyChanged: OnStateChanged);

    public static readonly BindableProperty CommandProperty =
        BindableProperty.Create(nameof(Command), typeof(ICommand), typeof(NavTab));

    public string? IconData
    {
        get => (string?)GetValue(IconDataProperty);
        set => SetValue(IconDataProperty, value);
    }

    public string? Text
    {
        get => (string?)GetValue(TextProperty);
        set => SetValue(TextProperty, value);
    }

    public int Index
    {
        get => (int)GetValue(IndexProperty);
        set => SetValue(IndexProperty, value);
    }

    public int SelectedIndex
    {
        get => (int)GetValue(SelectedIndexProperty);
        set => SetValue(SelectedIndexProperty, value);
    }

    public ICommand? Command
    {
        get => (ICommand?)GetValue(CommandProperty);
        set => SetValue(CommandProperty, value);
    }

    public NavTab()
    {
        InitializeComponent();

        var tap = new TapGestureRecognizer();
        tap.Tapped += (_, _) =>
        {
            if (Command?.CanExecute(Index) == true) Command.Execute(Index);
        };
        GestureRecognizers.Add(tap);

        ApplyState();
    }

    static void OnIconChanged(BindableObject b, object o, object n)
    {
        if (b is NavTab t && n is string data)
            t.Glyph.Data = (Geometry)new PathGeometryConverter().ConvertFromInvariantString(data)!;
    }

    static void OnTextChanged(BindableObject b, object o, object n)
    {
        if (b is NavTab t) t.Caption.Text = n as string;
    }

    static void OnStateChanged(BindableObject b, object o, object n)
    {
        if (b is NavTab t) t.ApplyState();
    }

    /// <summary>
    /// The current destination takes Interactive/Primary; the rest take
    /// Text/Secondary. Applied as an app-theme pair rather than a flat colour,
    /// so switching the device to dark mode does not strand the bar in light
    /// colours.
    /// </summary>
    void ApplyState()
    {
        var active = Index == SelectedIndex;

        var light = Token(active ? "SrColorInteractivePrimary" : "SrColorTextSecondary");
        var dark = Token(active ? "SrColorInteractivePrimaryDark" : "SrColorTextSecondaryDark");

        Caption.SetAppThemeColor(Label.TextColorProperty, light, dark);
        Glyph.SetAppTheme<Brush>(Shape.StrokeProperty, new SolidColorBrush(light), new SolidColorBrush(dark));

        // The label is Medium weight in the design. MAUI has no medium
        // FontAttributes, so the current destination is distinguished by colour
        // alone here — see the README's note on Roboto-Medium.
        SemanticProperties.SetDescription(this, active ? $"{Text}, current page" : Text ?? string.Empty);
    }

    /// <summary>
    /// Resolve a token by key. Deliberately unguarded: a missing key means the
    /// design system layer did not merge, and failing loudly on the device is
    /// more useful than rendering in a silent fallback colour.
    /// </summary>
    static Color Token(string key) => (Color)Application.Current!.Resources[key];
}
