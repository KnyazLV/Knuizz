using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace knuizz_api.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCascadeDeleteToQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_UserQuizzes_UserQuizId",
                table: "Questions");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_UserQuizzes_UserQuizId",
                table: "Questions",
                column: "UserQuizId",
                principalTable: "UserQuizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_UserQuizzes_UserQuizId",
                table: "Questions");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_UserQuizzes_UserQuizId",
                table: "Questions",
                column: "UserQuizId",
                principalTable: "UserQuizzes",
                principalColumn: "Id");
        }
    }
}
