using Microsoft.Maui.Controls.Shapes;

// System.IO is an implicit using, and it also has a Path. Without this alias
// every bare `Path` here is CS0104 — ambiguous — and the file does not compile.
using Path = Microsoft.Maui.Controls.Shapes.Path;

namespace SrTestbed.Views;

public partial class DiagnosticsView : ContentView
{
    public DiagnosticsView()
    {
        InitializeComponent();

        BuildSwatches();
        BuildIconGrid();
        Refresh();

        if (Application.Current is { } app)
            app.RequestedThemeChanged += (_, _) => Refresh();
    }

    void OnSystem(object? s, EventArgs e) { SetTheme(AppTheme.Unspecified); }
    void OnLight(object? s, EventArgs e) { SetTheme(AppTheme.Light); }
    void OnDark(object? s, EventArgs e) { SetTheme(AppTheme.Dark); }

    static void SetTheme(AppTheme theme)
    {
        if (Application.Current is { } app) app.UserAppTheme = theme;
    }

    void Refresh()
    {
        var app = Application.Current;
        var requested = app?.RequestedTheme ?? AppTheme.Unspecified;
        var chosen = app?.UserAppTheme ?? AppTheme.Unspecified;

        ThemeState.Text = chosen == AppTheme.Unspecified
            ? $"Following the device — currently {requested}."
            : $"Forced to {chosen} in-app. The device is asking for {requested}.";

        var display = DeviceDisplay.MainDisplayInfo;
        var lines = new List<string>
        {
            $"{DeviceInfo.Platform} {DeviceInfo.VersionString} · {DeviceInfo.Idiom}",
            $"{DeviceInfo.Manufacturer} {DeviceInfo.Model}",
            $"Screen {display.Width:0}x{display.Height:0} at {display.Density:0.##}x density",
            $"= {display.Width / display.Density:0}x{display.Height / display.Density:0} device-independent units",
        };

#if ANDROID
        // The number that matters for the 200% test. There is no cross-platform
        // MAUI API for it, so it is read from the Android configuration directly.
        var scale = Android.App.Application.Context?.Resources?.Configuration?.FontScale;
        lines.Add(scale is { } f
            ? $"System font scale {f:0.##}x ({f * 100:0}%)"
            : "System font scale unavailable");
#endif

        EnvReadout.Text = string.Join("\n", lines);
    }

    /// <summary>
    /// Every semantic with a `…Dark` twin, shown as a pair of swatches. These are
    /// the only tokens whose value actually changes between modes, so they are
    /// the ones worth watching when the theme flips.
    /// </summary>
    void BuildSwatches()
    {
        var resources = Application.Current?.Resources;
        if (resources is null) return;

        var all = AllKeys().ToHashSet(StringComparer.Ordinal);
        var keys = all
            .Where(k => k.StartsWith("SrColor", StringComparison.Ordinal))
            .Where(k => !k.EndsWith("Dark", StringComparison.Ordinal))
            .Where(k => all.Contains(k + "Dark"))
            .OrderBy(k => k, StringComparer.Ordinal)
            .ToList();

        SwatchCaption.Text = $"{keys.Count} semantics carry a Dark twin. "
            + "The left block is the light value, the right the dark one; the row's "
            + "own fill is whichever the theme currently resolves to.";

        foreach (var key in keys)
        {
            if (Lookup(key) is not Color light || Lookup(key + "Dark") is not Color dark) continue;

            var row = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition(GridLength.Auto),
                    new ColumnDefinition(GridLength.Auto),
                    new ColumnDefinition(GridLength.Star),
                },
                ColumnSpacing = 8,
            };

            row.Add(Swatch(light), 0);
            row.Add(Swatch(dark), 1);

            var label = new Label
            {
                Text = key.Replace("SrColor", string.Empty),
                VerticalOptions = LayoutOptions.Center,
            };
            label.StyleClass = new[] { "Caption" };
            row.Add(label, 2);

            Swatches.Add(row);
        }
    }

    static Border Swatch(Color fill) => new()
    {
        WidthRequest = 28,
        HeightRequest = 20,
        Padding = 0,
        BackgroundColor = fill,
        StrokeThickness = 1,
        Stroke = new SolidColorBrush(Colors.Grey),
        StrokeShape = new RoundRectangle { CornerRadius = 4 },
        VerticalOptions = LayoutOptions.Center,
    };

    /// <summary>
    /// Renders every icon geometry the design system ships. This is the only way
    /// to find out that a converted path is malformed — the build can prove the
    /// coordinates match the source SVG, but not that XAML will parse them.
    /// </summary>
    void BuildIconGrid()
    {
        var keys = AllKeys()
            .Where(k => k.StartsWith("SrIcon", StringComparison.Ordinal))
            .OrderBy(k => k, StringComparer.Ordinal)
            .ToList();

        var failed = 0;

        foreach (var key in keys)
        {
            if (Lookup(key) is not string data) continue;

            var cell = new VerticalStackLayout
            {
                WidthRequest = 64,
                Spacing = 2,
                Margin = new Thickness(0, 0, 4, 8),
            };

            try
            {
                var glyph = new Path
                {
                    Data = (Geometry)new PathGeometryConverter().ConvertFromInvariantString(data)!,
                    Aspect = Stretch.Uniform,
                    HeightRequest = 24,
                    WidthRequest = 24,
                    StrokeThickness = 2,
                    StrokeLineCap = PenLineCap.Round,
                    StrokeLineJoin = PenLineJoin.Round,
                    HorizontalOptions = LayoutOptions.Center,
                };
                glyph.SetAppTheme<Brush>(
                    Shape.StrokeProperty,
                    new SolidColorBrush((Color)Lookup("SrColorTextPrimary")!),
                    new SolidColorBrush((Color)Lookup("SrColorTextPrimaryDark")!));
                cell.Add(glyph);
            }
            catch (Exception ex)
            {
                failed++;
                var error = new Label { Text = "!", HorizontalTextAlignment = TextAlignment.Center };
                error.StyleClass = new[] { "Error" };
                cell.Add(error);
                System.Diagnostics.Debug.WriteLine($"[sr-maui] {key} failed to parse: {ex.Message}");
            }

            var caption = new Label
            {
                Text = key.Replace("SrIcon", string.Empty),
                FontSize = 8,
                HorizontalTextAlignment = TextAlignment.Center,
                LineBreakMode = LineBreakMode.WordWrap,
            };
            caption.StyleClass = new[] { "Caption" };
            cell.Add(caption);

            IconGrid.Add(cell);
        }

        IconCaption.Text = failed == 0
            ? $"{keys.Count} icons, all parsed."
            : $"{keys.Count} icons — {failed} FAILED TO PARSE (marked !). Check the debug log.";
    }

    // ── Resource access ─────────────────────────────────────────────────────
    // Resources.MergedDictionaries has to be walked explicitly: the indexer
    // resolves a known key but will not enumerate what is available.

    static IEnumerable<string> AllKeys()
    {
        var root = Application.Current?.Resources;
        if (root is null) return [];

        var keys = new List<string>(root.Keys.Select(k => k.ToString()!));
        foreach (var dict in root.MergedDictionaries)
            keys.AddRange(dict.Keys.Select(k => k.ToString()!));
        return keys;
    }

    static object? Lookup(string key)
        => Application.Current?.Resources.TryGetValue(key, out var v) == true ? v : null;
}
