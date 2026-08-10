# Document Viewer

**Status:** Approved  
**Last updated:** 2026-08

---

## Purpose

Display PDF documents in the mobile application. This is a wrapper component that presents Syncfusion's `SfPdfViewer` through a Single Record design contract, providing a consistent API, security model, and visual integration with the token and style layer.

**Why wrap:** The design system would never design a PDF viewer — it is too domain-specific and Syncfusion's control is the right tool for the job. The wrapper constrains Syncfusion's large surface to what Single Record needs, isolates the dependency to one file (if Syncfusion's licensing or requirements change, only this file changes), and provides the security and theming contracts that a developer implementing it needs to understand.

---

## Variants

| Variant | Usage |
|---|---|
| Default | Full-height document viewer, takes available space within its container |

No mobile-optimized toolbar — the host page provides any navigation or action buttons.

---

## Anatomy

```
┌─────────────────────────────────────┐
│        Page Navigation Bar          │  (optional, provided by host)
├─────────────────────────────────────┤
│                                     │
│     SfPdfViewer (Document)          │  Container takes full available space
│     - PDF rendering                 │
│     - Pinch to zoom                 │
│     - Page scrolling                │
│                                     │
└─────────────────────────────────────┘
```

- **Document container**: Renders the PDF, handles zoom/scroll/page navigation, fills available width and height.
- **Navigation bar** (optional, host responsibility): Page indicator, forward/back buttons — not part of the wrapper's contract.

---

## States

| State | Visual behaviour |
|---|---|
| Default | Document displayed, ready for interaction |
| Loading | (host responsibility) Loading state before PDF is ready — show a progress indicator or skeleton outside this component |
| Error | (host responsibility) Document failed to load — host displays an error message; component does not catch exceptions |
| Empty | (host responsibility) No document to display — host checks for null/empty state before rendering |

**State management rationale:** The wrapper is data-in, render-out. State handling (loading, error, empty) lives in the hosting page because it affects layout, navigation flow, and error recovery — responsibilities outside a viewer's scope. The wrapper itself renders whatever it is given and throws if the PDF is malformed.

---

## Sizing

| Dimension | Value | Notes |
|---|---|---|
| Width | 100% of container | Responsive to the host layout |
| Height | 100% of container | Host is responsible for constraining height (typically the full viewport minus header/footer/nav) |
| Minimum | (no minimum) | Component fills its container; host layout provides the constraint |

Touch targets (page controls, zoom buttons) are Syncfusion defaults and meet WCAG 2.2 SC 2.5.8 (44×44px minimum).

---

## Responsive behaviour

**Form factor:** Distinct  
The Document Viewer is mobile-only in Single Record (MAUI). Blazor or other platforms use their own PDF solutions (e.g. a third-party browser PDF viewer). There is no desktop equivalent in this design system.

| Platform | Implementation |
|---|---|
| Mobile (MAUI) | This wrapper; full-screen or constrained viewport view depending on the screen |
| Web / Blazor | N/A — not in scope for Single Record |

---

## Spacing

No internal padding — the component renders edge-to-edge within its container. The hosting page is responsible for any spacing around the viewer (e.g., padding the containing `Frame` or `Grid` cell).

---

## Accessibility

- **Accessible name:** Not needed — the page that hosts this component should have a heading (e.g., "View document" or the document's title) that names the content area.
- **Role:** N/A — Syncfusion's `SfPdfViewer` does not have an explicit ARIA role; it is a custom interactive container.
- **Keyboard:** Scroll, zoom, and page navigation use standard pinch and tap gestures on mobile. No keyboard interaction is typical on a phone/tablet.
- **Screen reader:** PDFs themselves are not screen-readable through a viewer control — a screen reader cannot traverse the PDF's text structure. For clinical documents that must be accessible to screen-reader users, the document should have a text transcript or be provided in an accessible format (HTML, plain text) alongside the PDF option. This is a hosting-page concern, not this component's.
- **Mobile accessibility:** Touch targets on Syncfusion's controls meet WCAG 2.2 SC 2.5.8. Ensure the hosting page provides a clear way to exit the viewer (back button, close button) and does not trap focus inside the scrolling PDF.

---

## Theming

The Document Viewer inherits the app's light/dark theme via `AppThemeBinding`. Syncfusion's default toolbar uses named colors (`Gray`, `Black`); these are overridden by `Styles.xaml` to use SR semantic tokens:

| Element | Token (Light) | Token (Dark) |
|---|---|---|
| Toolbar background | `Surface/Secondary` | `Surface/SecondaryDark` |
| Toolbar text | `Text/Primary` | `Text/PrimaryDark` |
| Toolbar icon stroke | `Text/Secondary` | `Text/SecondaryDark` |
| Page background | `Surface/Primary` | `Surface/PrimaryDark` |

These tokens are applied via implicit `SfPdfViewer` style in `Styles.xaml`. No additional theming configuration is needed in the wrapper itself; it reads colors from the resource dictionary at render time.

---

## API Contract

### Constructor / Initialization

```csharp
var viewer = new SrDocumentViewer();
viewer.BindingContext = viewModel;
```

### Properties

| Property | Type | Default | Purpose |
|---|---|---|---|
| `SourceStream` | `Stream` | `null` | The PDF document as a byte stream (required). Bindable property. Must be set before the component is rendered. |
| `EnableTextSelection` | `bool` | `true` | Allow users to select and copy text from the PDF. Set to `false` if the document is sensitive. |
| `ZoomLevel` | `double` | 1.0 | Initial zoom level (1.0 = fit to page). Read/write. |

### Methods

| Method | Purpose |
|---|---|
| `GoToPage(int pageNumber)` | Navigate to a specific page (1-indexed). No-op if page number is out of range. |
| `NextPage()` | Move to the next page. No-op if already on the last page. |
| `PreviousPage()` | Move to the previous page. No-op if already on the first page. |
| `Dispose()` | Release the PDF stream and clear internal state (see Disposal model below). |

### Events / Callbacks

| Event | Fired when |
|---|---|
| `DocumentLoaded` | The PDF has been parsed and is ready to display. Handler receives page count. |
| `PageChanged` | User navigates to a different page. Handler receives new page number and total count. |
| `DocumentLoadFailed` | The PDF failed to load (malformed, invalid stream, etc.). Handler receives an exception. |

---

## Disposal and Memory Management

**The wrapper is responsible for calling `Dispose()` on the Syncfusion viewer** once the hosting page no longer needs it.

- Set `SourceStream = null` **before** disposing to release the document stream.
- Call `Dispose()` on the component when the page is closed or navigated away from.
- Memory is **not** automatically released when the component is removed from the visual tree — explicit disposal is required.

**Why explicit disposal:** .NET Syncfusion controls hold unmanaged resources (file handles, allocated memory for PDF parsing). Relying on garbage collection is unreliable; cleanup must be explicit to avoid memory leaks in a long-running app.

**Pattern for MVVM pages:**

```csharp
public partial class DocumentViewPage : ContentPage, IDisposable
{
    public DocumentViewPage()
    {
        InitializeComponent();
    }

    protected override void OnNavigatedFrom(NavigatedFromEventArgs args)
    {
        base.OnNavigatedFrom(args);
        viewer.SourceStream = null;
        viewer.Dispose();
    }

    public void Dispose()
    {
        viewer?.Dispose();
    }
}
```

---

## Security Considerations

**In-memory PDF handling:**

- PDFs are loaded as byte streams and held in memory. For large documents (>10MB) consider pagination or splitting into chapters.
- The stream is **not** encrypted by the viewer — if the document contains sensitive clinical data, the hosting page is responsible for ensuring it is not cached to disk and is cleared from memory after viewing.
- `EnableTextSelection` should be `false` for documents containing sensitive identifiers or clinical findings that should not be copypasteable.

**Source validation:**

- The component assumes the `SourceStream` is a valid PDF. No validation is performed — malformed streams will throw during parsing (host should catch and display an error).
- Always validate the PDF source at the application boundary (e.g., after downloading from a server) before passing it to this component.

---

## Engineering Notes

### Blazor RCL / Web

There is no Blazor wrapper for this component. Blazor and web applications use their own PDF solutions (e.g., a third-party JavaScript PDF viewer like PDF.js, or an embedded viewer). Single Record's PDF viewer is MAUI-specific.

### MAUI / Native XAML

**Package:** `DHCW.SingleRecord.Maui` (NuGet)  
**Implementation file:** `SrDocumentViewer.xaml.cs` + `SrDocumentViewer.xaml`  
**Dependency:** Syncfusion.Maui.PdfViewer

The wrapper extends `SfPdfViewer` and applies SR theming. No additional styles are needed beyond what `Styles.xaml` provides.

**Token references:**
- `SrColorSurfaceSecondary` / `SrColorSurfaceSecondaryDark` (toolbar background)
- `SrColorTextPrimary` / `SrColorTextPrimaryDark` (toolbar text)
- `SrColorTextSecondary` / `SrColorTextSecondaryDark` (toolbar icons)
- `SrColorSurfacePrimary` / `SrColorSurfacePrimaryDark` (page background)

### Implementation Responsibilities

**The developer implementing this component must:**

1. Confirm Syncfusion licensing with the product team — this wrapper requires a valid Syncfusion license seat.
2. Wire up `DocumentLoaded` and `DocumentLoadFailed` events to the hosting page's state management so loading/error states can be shown.
3. Ensure `Dispose()` is called when the page closes (see Disposal model above).
4. Validate PDF sources before passing them to the viewer.

---

## Do / Don't

| Do | Don't |
|---|---|
| Wrap the viewer in a container with a defined height (e.g., `<Grid RowDefinitions="*">`) so it fills available space cleanly | Use a fixed height — the viewer should flex to its container, not impose a size |
| Validate and handle load errors from `DocumentLoadFailed` at the page level | Assume the PDF is always valid; catch exceptions and display user-friendly error messages |
| Set `SourceStream = null` before disposing to release memory | Dispose without clearing the stream, leaving resources in limbo |
| Use `EnableTextSelection = false` for sensitive documents | Allow text selection on documents containing patient identifiers or sensitive clinical data |
| Call `Dispose()` in `OnNavigatedFrom` or a page-lifecycle cleanup handler | Rely on garbage collection to clean up Syncfusion resources |

---

## Related

- **Patterns:** [Case Note Tracking — document view flow]  
- **Tokens:** `Surface/Primary`, `Surface/Secondary`, `Text/Primary`, `Text/Secondary`  
- **Engineering:** `docs/for-engineers.md` ("What runs where" — MAUI section)  
- **MAUI setup:** `packages/maui/README.md`  
- **Syncfusion:** [SfPdfViewer documentation](https://www.syncfusion.com/maui-controls/maui-pdf-viewer) (license required)
