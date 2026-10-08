namespace SynergyPartners;

/// <summary>
/// How the page loads the Zocdoc bundle, plus the roster's search. Mode and token come from the
/// environment (ZOCDOC_MODE, ZOCDOC_TOKEN, ZOCDOC_BASE_URL) or user-secrets, never from a
/// committed appsettings file.
/// </summary>
public sealed class ZocdocOptions
{
    public string Mode { get; set; } = "mock";
    public string? Token { get; set; }
    public string? BaseUrl { get; set; }
    public RosterOptions Roster { get; set; } = new();

    public bool IsLive => Mode == "live" && !string.IsNullOrEmpty(Token);
    public bool LiveRequestedWithoutToken => Mode == "live" && string.IsNullOrEmpty(Token);
}

public sealed class RosterOptions
{
    public string ZipCode { get; set; } = "11201";
    public string SpecialtyId { get; set; } = "sp_153";
    public string? InsurancePlanId { get; set; }
}
