namespace WcpPrototype;

/// <summary>
/// Shows an exception as text. Built in code with no styles or resources,
/// because it has to work when the resources themselves failed to load.
/// Prototype diagnostics only.
/// </summary>
public static class ErrorPage
{
    public static Page For(Exception ex) => new ContentPage
    {
        Content = new ScrollView
        {
            Content = new VerticalStackLayout
            {
                Padding = 16,
                Spacing = 12,
                Children =
                {
                    new Label { Text = "The prototype could not start", FontSize = 20, FontAttributes = FontAttributes.Bold },
                    new Label { Text = "Screenshot this and send it to the design system team." },
                    new Label { Text = ex.ToString(), FontSize = 12 },
                },
            },
        },
    };
}
