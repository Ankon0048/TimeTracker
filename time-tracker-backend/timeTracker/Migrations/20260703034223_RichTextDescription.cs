using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace timeTracker.Migrations
{
    /// <inheritdoc />
    public partial class RichTextDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Tasks",
                type: "text",
                nullable: false,
                comment: "HTML rich text content. Supports bold, lists, headings, links, etc.",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Projects",
                type: "text",
                nullable: false,
                comment: "HTML rich text content. Supports bold, lists, headings, links, etc.",
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Tasks",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldComment: "HTML rich text content. Supports bold, lists, headings, links, etc.");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Projects",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldComment: "HTML rich text content. Supports bold, lists, headings, links, etc.");
        }
    }
}
