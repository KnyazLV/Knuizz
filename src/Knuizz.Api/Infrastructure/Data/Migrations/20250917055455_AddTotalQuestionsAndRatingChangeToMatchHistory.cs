using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Knuizz.Api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalQuestionsAndRatingChangeToMatchHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RatingChange",
                table: "MatchHistories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuestions",
                table: "MatchHistories",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RatingChange",
                table: "MatchHistories");

            migrationBuilder.DropColumn(
                name: "TotalQuestions",
                table: "MatchHistories");
        }
    }
}
