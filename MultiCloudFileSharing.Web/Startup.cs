using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MultiCloudFileSharing.Web.Options;
using MultiCloudFileSharing.Web.Interfaces;
using MultiCloudFileSharing.Web.Services;

namespace MultiCloudFileSharing.Web
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            const string AwsPlatform = "aws";
            const string AzurePlatform = "azure";

            services.Configure<DeploymentOptions>(Configuration.GetSection("Deployment"));
            services.Configure<FileMetadataServiceOptions>(Configuration.GetSection("FileMetadataApi"));

            services.AddTransient<IFileMetadataServiceProxy, FileMetadataServiceProxy>();

            var platform = Configuration["Deployment:Platform"].ToLower();

            if (platform == AwsPlatform)
            {
                services.Configure<AwsFileStorageOptions>(Configuration.GetSection("AwsFileStorage"));

                services.AddTransient<IFileStorageService, AwsFileStorageService>();
            }
            else if (platform == AzurePlatform)
            {
                services.Configure<AzureFileStorageOptions>(Configuration.GetSection("AzureFileStorage"));

                services.AddTransient<IFileStorageService, AzureFileStorageService>();
            }

            services.AddMvc();
        }

        private void ConfigureOptions(IServiceCollection services)
        {

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
