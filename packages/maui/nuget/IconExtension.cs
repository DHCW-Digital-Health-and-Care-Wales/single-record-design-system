// AUTO-COPIED from packages/maui/IconExtension.cs by build-nuget.mjs — edit that file.
using Microsoft.Maui.Controls.Shapes;

namespace DHCW.SingleRecord.Maui;

/// <summary>
/// Puts a Single Record icon on a <c>Path</c>:
/// <code>&lt;Path Data="{sr:Icon NavSearch}" … /&gt;</code>
///
/// Icons.xaml stores each icon as path data in an <c>x:String</c>. Writing
/// <c>Data="{StaticResource SrIconNavSearch}"</c> hands that string straight to
/// a property of type Geometry, and MAUI does not convert it: the icon is
/// simply not drawn, with no error at build or at run time. This extension
/// does the conversion. Found on BrowserStack, 2026-11-07
/// (docs/engineering/known-issues.md).
///
/// The key may be written with or without the SrIcon prefix. The icons are
/// read from the app's resources, so SrIcons (NuGet) or Icons.xaml (copied
/// files) must be merged in App.xaml, as for every other resource.
/// </summary>
[ContentProperty(nameof(Key))]
public sealed class IconExtension : IMarkupExtension<Geometry>
{
    public string Key { get; set; } = string.Empty;

    public Geometry ProvideValue(IServiceProvider serviceProvider)
    {
        var name = Key.StartsWith("SrIcon", StringComparison.Ordinal) ? Key : "SrIcon" + Key;
        if (Application.Current?.Resources.TryGetValue(name, out var value) != true || value is not string data)
            throw new InvalidOperationException(
                $"No icon \"{name}\". Check the name in foundations/iconography/catalogue.md, and that SrIcons is merged in App.xaml.");
        return (Geometry)new PathGeometryConverter().ConvertFromInvariantString(data)!;
    }

    object IMarkupExtension.ProvideValue(IServiceProvider serviceProvider) => ProvideValue(serviceProvider);
}
