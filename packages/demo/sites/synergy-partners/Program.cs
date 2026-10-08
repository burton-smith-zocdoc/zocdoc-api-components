using SynergyPartners;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.Configure<ZocdocOptions>(builder.Configuration.GetSection("Zocdoc"));
builder.Services.PostConfigure<ZocdocOptions>(options =>
{
    // Flat env var names, matching the PHP site and the README.
    options.Mode = Environment.GetEnvironmentVariable("ZOCDOC_MODE") ?? options.Mode;
    options.Token = Environment.GetEnvironmentVariable("ZOCDOC_TOKEN") ?? options.Token;
    options.BaseUrl = Environment.GetEnvironmentVariable("ZOCDOC_BASE_URL") ?? options.BaseUrl;
});

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();

app.Run();
