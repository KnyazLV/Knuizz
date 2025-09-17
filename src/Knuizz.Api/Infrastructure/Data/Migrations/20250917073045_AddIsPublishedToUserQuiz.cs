using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Knuizz.Api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPublishedToUserQuiz : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "UserQuizzes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "UserQuizzes");
        }
    }
}
