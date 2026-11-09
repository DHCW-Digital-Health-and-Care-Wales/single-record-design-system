using Microsoft.Maui.Controls.Shapes;
using Path = Microsoft.Maui.Controls.Shapes.Path;

namespace WcpPrototype.Views;

public partial class HomeView : ContentView
{
    /// <summary>Fixed demo counts, in the order drawn.</summary>
    static readonly (string Label, int Count, bool Overdue)[] Rows =
    {
        ("Results to sign off", 9, false),
        ("Overdue tasks", 24, true),
        ("Referrals awaiting prioritisation", 3, false),
        ("Unsigned discharge letters", 3, false),
        ("New test notifications", 2, false),
    };

    public HomeView()
    {
        InitializeComponent();
        if (Flow.ShowPinSetConfirmation)
        {
            PinSet.IsVisible = true;
            Flow.ShowPinSetConfirmation = false;
            SemanticScreenReader.Announce("Your PIN is set up");
        }
        for (var i = 0; i < Rows.Length; i++)
        {
            if (i > 0) Attention.Add(new BoxView { StyleClass = new[] { "Divider" } });
            Attention.Add(BuildRow(Rows[i]));
        }
    }

    public void FocusSearch() => NhsNumber.Focus();

    View BuildRow((string Label, int Count, bool Overdue) r)
    {
        var grid = new Grid
        {
            Style = Res<Style>("Row"),
            ColumnDefinitions = new ColumnDefinitionCollection(
                new ColumnDefinition(GridLength.Star), new ColumnDefinition(GridLength.Auto),
                new ColumnDefinition(GridLength.Auto), new ColumnDefinition(GridLength.Auto)),
        };
        grid.Add(new Label { Text = r.Label, VerticalOptions = LayoutOptions.Center }, 0);

        if (r.Overdue)
        {
            var tagText = new Label { Text = "Overdue", StyleClass = new[] { "TagTextCritical" } };
            grid.Add(new Border
            {
                Style = Res<Style>("TagCritical"),
                Stroke = Res<Color>("SrColorStatusError"),
                StrokeThickness = 1,
                VerticalOptions = LayoutOptions.Center,
                Content = tagText,
            }, 1);
        }

        var count = new Label
        {
            Text = r.Count.ToString(),
            StyleClass = new[] { "HeadingXs", "Bold" },
            VerticalOptions = LayoutOptions.Center,
        };
        // The overdue count is red as drawn, and the tag says why in words.
        if (r.Overdue) count.TextColor = Res<Color>("SrColorStatusError");
        grid.Add(count, 2);

        grid.Add(new Path
        {
            Style = Res<Style>("IconSecondary"),
            Data = (Geometry)new PathGeometryConverter().ConvertFromInvariantString(Res<string>("SrIconNavChevronRight"))!,
        }, 3);

        SemanticProperties.SetDescription(grid, r.Overdue ? $"{r.Label}, {r.Count}, overdue" : $"{r.Label}, {r.Count}");
        var tap = new TapGestureRecognizer();
        tap.Tapped += async (_, _) => await Prototype.NotInPrototype(this, r.Label);
        grid.GestureRecognizers.Add(tap);
        return grid;
    }

    void OnDismissPinSet(object? sender, TappedEventArgs e) => PinSet.IsVisible = false;

    void OnDismiss(object? sender, TappedEventArgs e)
    {
        Motd.IsVisible = false;
        SemanticScreenReader.Announce("Message of the day dismissed");
    }

    async void OnSearch(object? sender, EventArgs e) => await Search();

    async void OnSearchTapped(object? sender, TappedEventArgs e) => await Search();

    Task Search() => Prototype.NotInPrototype(this, "Patient search");

    async void OnNotInPrototype(object? sender, TappedEventArgs e)
        => await Prototype.NotInPrototype(this, e.Parameter as string);

    static T Res<T>(string key) => (T)Application.Current!.Resources[key];
}
