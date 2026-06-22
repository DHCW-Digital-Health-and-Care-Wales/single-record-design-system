# @dhcw/sr-maui

.NET MAUI controls for the DHCW Single Record Design System.

Consumes `@dhcw/sr-tokens` XAML ResourceDictionary output (`Tokens.xaml`, `Tokens.Dark.xaml`). Published as a NuGet package.

MAUI cannot consume CSS custom properties, so this is the only package that requires XAML-format tokens. The token build pipeline generates these automatically from the same JSON source.

**Status:** Planned — depends on `@dhcw/sr-tokens` XAML output.
